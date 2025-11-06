    // Enhanced File Tree Implementation
    class FileExplorer {
      constructor() {
        this.container = document.getElementById('treeView');
        this.detailsPanel = document.getElementById('fileDetails');
        this.files = [];
        this.tree = null;
        this.selectedItem = null;
        this.stats = {
          files: 0,
          folders: 0,
          totalSize: 0,
          largestFile: { name: '', size: 0 }
        };
      }

      // Initialize the explorer
      async init() {
        await this.loadFileSystem();
        this.setupEventListeners();
      }

      // Setup event listeners
      setupEventListeners() {
        document.getElementById('expandAllBtn').addEventListener('click', () => this.expandAll());
        document.getElementById('collapseAllBtn').addEventListener('click', () => this.collapseAll());
        document.getElementById('refreshBtn').addEventListener('click', () => this.refresh());
      }

      // Load file system data
      async loadFileSystem() {
        this.showLoading();

        try {
          // Load file system stats
          await this.loadStats();

          // Load file list
          const response = await fetch('/api/files/list');
          if (!response.ok) throw new Error('Failed to load files');

          const data = await response.json();
          this.files = data.files || [];

          // Build tree structure
          this.buildTree();

          // Render the tree
          this.render();

          // Update statistics
          this.updateStatistics();

        } catch (error) {
          console.error('Error loading files:', error);
          this.showError('Failed to load file system');
        }
      }

      // Load file system stats
      async loadStats() {
        try {
          const response = await fetch('/api/system/info');
          if (!response.ok) throw new Error('Failed to fetch system info');

          const data = await response.json();
          const totalMB = (data.fsTotal / 1024 / 1024).toFixed(2);
          const usedMB = (data.fsUsed / 1024 / 1024).toFixed(2);
          const freeMB = ((data.fsTotal - data.fsUsed) / 1024 / 1024).toFixed(2);
          const usagePercent = ((data.fsUsed / data.fsTotal) * 100).toFixed(1);

          // Update overview
          document.getElementById('fsTotal').textContent = totalMB + ' MB';
          document.getElementById('fsUsed').textContent = usedMB + ' MB';
          document.getElementById('fsFree').textContent = freeMB + ' MB';
          document.getElementById('fsPercent').textContent = usagePercent + '%';

          // Update usage bar
          document.getElementById('fsUsageBar').style.width = usagePercent + '%';

        } catch (error) {
          console.error('Error loading stats:', error);
        }
      }

      // Build tree structure from flat file list
      buildTree() {
        this.tree = {
          name: 'root',
          type: 'folder',
          path: '/',
          children: [],
          size: 0,
          expanded: true
        };

        this.stats = {
          files: 0,
          folders: 0,
          totalSize: 0,
          largestFile: { name: '', size: 0 }
        };

        // Separate directories and files
        const directories = this.files.filter(f => f.isDirectory);
        const files = this.files.filter(f => !f.isDirectory);

        // Sort for better organization
        directories.sort((a, b) => a.path.localeCompare(b.path));
        files.sort((a, b) => a.path.localeCompare(b.path));

        // Process directories first to build folder structure
        directories.forEach(dir => {
          // Remove leading slash and split path
          const cleanPath = dir.path.startsWith('/') ? dir.path.substring(1) : dir.path;
          const parts = cleanPath.split('/').filter(p => p);
          let current = this.tree;

          // Navigate/create nested folder structure
          for (let i = 0; i < parts.length; i++) {
            const folderName = parts[i];

            let folder = current.children.find(c => c.name === folderName && c.type === 'folder');
            if (!folder) {
              folder = {
                name: folderName,
                type: 'folder',
                path: '/' + parts.slice(0, i + 1).join('/'),
                children: [],
                size: 0,
                expanded: false
              };
              current.children.push(folder);
              this.stats.folders++;
            }
            current = folder;
          }
        });

        // Now add files to the tree
        files.forEach(file => {
          // Remove leading slash and split path
          const cleanPath = file.path.startsWith('/') ? file.path.substring(1) : file.path;
          const parts = cleanPath.split('/');
          let current = this.tree;

          // If file is in a subdirectory, navigate to it
          if (parts.length > 1) {
            // Navigate to the correct folder (all parts except last which is filename)
            for (let i = 0; i < parts.length - 1; i++) {
              const folderName = parts[i];

              let folder = current.children.find(c => c.name === folderName && c.type === 'folder');
              if (!folder) {
                // Create folder if it doesn't exist (shouldn't happen if ESP sends all dirs)
                folder = {
                  name: folderName,
                  type: 'folder',
                  path: '/' + parts.slice(0, i + 1).join('/'),
                  children: [],
                  size: 0,
                  expanded: false
                };
                current.children.push(folder);
                this.stats.folders++;
              }

              // Accumulate size in parent folders
              folder.size += file.size;
              current = folder;
            }
          }

          // Add the file to the current folder
          const fileName = parts[parts.length - 1];
          if (fileName) {  // Only add if there's a filename
            current.children.push({
              name: fileName,
              type: 'file',
              path: file.path,
              size: file.size
            });

            // Update stats
            this.stats.files++;
            this.stats.totalSize += file.size;
            this.tree.size += file.size;

            if (file.size > this.stats.largestFile.size) {
              this.stats.largestFile = { name: fileName, size: file.size };
            }
          }
        });

        // Sort children in each folder (folders first, then alphabetically)
        this.sortChildren(this.tree);
      }

      // Sort children in a folder
      sortChildren(node) {
        if (node.children && node.children.length > 0) {
          node.children.sort((a, b) => {
            // Folders come before files
            if (a.type !== b.type) {
              return a.type === 'folder' ? -1 : 1;
            }
            // Alphabetical within same type
            return a.name.localeCompare(b.name);
          });

          // Recursively sort subfolders
          node.children.forEach(child => {
            if (child.type === 'folder') {
              this.sortChildren(child);
            }
          });
        }
      }

      // Render the tree
      render() {
        this.container.innerHTML = '';

        if (this.files.length === 0) {
          this.showError('No files found in LittleFS');
          return;
        }

        const ul = document.createElement('ul');
        this.renderNode(this.tree, ul, 0, true);
        this.container.appendChild(ul);
      }

      // Render a single node
      renderNode(node, parentElement, depth, isRoot = false) {
        if (isRoot) {
          // Render root children directly
          node.children.forEach((child, index) => {
            this.renderNode(child, parentElement, depth, false, index === node.children.length - 1);
          });
          return;
        }

        const li = document.createElement('li');

        // Create item container
        const item = document.createElement('div');
        item.className = 'tree-item';
        if (node.type === 'folder') {
          item.classList.add('folder');
        }

        // Add indentation with tree lines
        for (let i = 0; i < depth; i++) {
          const indent = document.createElement('span');
          indent.className = 'tree-indent';

          // Add vertical line for parent levels
          if (i < depth - 1) {
            const line = document.createElement('span');
            line.className = 'tree-line';
            indent.appendChild(line);
          }

          // Add horizontal line for last level
          if (i === depth - 1) {
            const hLine = document.createElement('span');
            hLine.className = 'tree-line-horizontal';
            indent.appendChild(hLine);
          }

          item.appendChild(indent);
        }

        // Add expand/collapse arrow for folders
        if (node.type === 'folder') {
          const arrow = document.createElement('span');
          arrow.className = 'tree-arrow';
          arrow.innerHTML = node.children.length > 0 ? '▶' : '';
          if (node.children.length === 0) {
            arrow.classList.add('empty');
          }
          if (node.expanded) {
            arrow.classList.add('expanded');
          }
          arrow.onclick = (e) => {
            e.stopPropagation();
            this.toggleFolder(node, arrow, li);
          };
          item.appendChild(arrow);
        } else {
          // Empty space for files (no arrow)
          const spacer = document.createElement('span');
          spacer.className = 'tree-arrow empty';
          item.appendChild(spacer);
        }

        // Add icon
        const icon = document.createElement('span');
        icon.className = 'tree-icon';
        if (node.type === 'folder') {
          icon.classList.add(node.expanded ? 'folder-open' : 'folder');
          icon.innerHTML = node.expanded ? '📂' : '📁';
        } else {
          icon.classList.add('file');
          icon.innerHTML = this.getFileIcon(node.name);
        }
        item.appendChild(icon);

        // Add label
        const label = document.createElement('span');
        label.className = 'tree-label';
        label.textContent = node.name;
        item.appendChild(label);

        // Add size
        const size = document.createElement('span');
        size.className = 'tree-size';
        size.textContent = this.formatSize(node.size);
        item.appendChild(size);

        // Add download button for files
        if (node.type === 'file') {
          const download = document.createElement('button');
          download.className = 'tree-download';
          download.innerHTML = '⬇ Download';
          download.title = 'Download this file';
          download.onclick = (e) => {
            e.stopPropagation();
            this.downloadFile(node.path);
          };
          item.appendChild(download);
        }

        // Add click handler
        item.onclick = () => this.selectItem(node, item);

        li.appendChild(item);

        // Add children container for folders
        if (node.type === 'folder' && node.children.length > 0) {
          const childrenContainer = document.createElement('ul');
          childrenContainer.className = 'tree-folder-content';
          if (node.expanded) {
            childrenContainer.classList.add('expanded');
          }

          // Render children
          node.children.forEach((child, index) => {
            this.renderNode(child, childrenContainer, depth + 1, false, index === node.children.length - 1);
          });

          li.appendChild(childrenContainer);
        }

        parentElement.appendChild(li);
      }

      // Toggle folder expansion
      toggleFolder(node, arrow, li) {
        node.expanded = !node.expanded;

        const icon = li.querySelector('.tree-icon.folder, .tree-icon.folder-open');
        const childrenContainer = li.querySelector('.tree-folder-content');

        if (node.expanded) {
          arrow.classList.add('expanded');
          icon.classList.remove('folder');
          icon.classList.add('folder-open');
          icon.innerHTML = '📂';
          if (childrenContainer) {
            childrenContainer.classList.add('expanded');
          }
        } else {
          arrow.classList.remove('expanded');
          icon.classList.remove('folder-open');
          icon.classList.add('folder');
          icon.innerHTML = '📁';
          if (childrenContainer) {
            childrenContainer.classList.remove('expanded');
          }
        }
      }

      // Select an item
      selectItem(node, element) {
        // Remove previous selection
        const allItems = this.container.querySelectorAll('.tree-item.selected');
        allItems.forEach(item => item.classList.remove('selected'));

        // Add selection
        element.classList.add('selected');
        this.selectedItem = element;

        // Update details panel
        this.showDetails(node);
      }

      // Show file/folder details
      showDetails(node) {
        const type = node.type === 'folder' ? 'Folder' : 'File';
        const itemCount = node.type === 'folder' ? `${node.children ? node.children.length : 0} items` : '';

        this.detailsPanel.innerHTML = `
          <div class="file-details-path">${node.path}</div>
          <div class="file-details-info">
            <div><span>Type:</span> ${type}</div>
            <div><span>Size:</span> ${this.formatSize(node.size)}</div>
            ${itemCount ? `<div><span>Contains:</span> ${itemCount}</div>` : ''}
          </div>
        `;
      }

      // Get file icon based on extension
      getFileIcon(filename) {
        const ext = filename.split('.').pop().toLowerCase();
        const icons = {
          'html': '📄',
          'css': '🎨',
          'js': '📜',
          'json': '📋',
          'txt': '📝',
          'log': '📃',
          'md': '📘',
          'xml': '📰',
          'cfg': '⚙️',
          'config': '⚙️',
          'ini': '⚙️'
        };
        return icons[ext] || '📄';
      }

      // Format file size
      formatSize(bytes) {
        if (bytes === 0) return '0 B';
        const units = ['B', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return (bytes / Math.pow(1024, i)).toFixed(i > 0 ? 1 : 0) + ' ' + units[i];
      }

      // Download file
      downloadFile(path) {
        showToast('Downloading: ' + path.split('/').pop(), 'info');
        window.location.href = '/api/files/download?path=' + encodeURIComponent(path);
      }

      // Expand all folders
      expandAll() {
        this.expandAllNodes(this.tree);
        this.render();
      }

      expandAllNodes(node) {
        if (node.type === 'folder') {
          node.expanded = true;
          if (node.children) {
            node.children.forEach(child => this.expandAllNodes(child));
          }
        }
      }

      // Collapse all folders
      collapseAll() {
        this.collapseAllNodes(this.tree);
        this.tree.expanded = true; // Keep root expanded
        this.render();
      }

      collapseAllNodes(node) {
        if (node.type === 'folder') {
          node.expanded = false;
          if (node.children) {
            node.children.forEach(child => this.collapseAllNodes(child));
          }
        }
      }

      // Refresh the file list
      async refresh() {
        const btn = document.getElementById('refreshBtn');
        btn.disabled = true;
        await this.loadFileSystem();
        btn.disabled = false;
        showToast('File system refreshed', 'success');
      }

      // Update statistics display
      updateStatistics() {
        document.getElementById('statFiles').textContent = this.stats.files;
        document.getElementById('statFolders').textContent = this.stats.folders;
        document.getElementById('statTotalSize').textContent = this.formatSize(this.stats.totalSize);
        document.getElementById('statLargestFile').textContent =
          this.stats.largestFile.name ?
          `${this.formatSize(this.stats.largestFile.size)}` : '--';
      }

      // Show loading state
      showLoading() {
        this.container.innerHTML = `
          <div class="tree-loading">
            <div class="spinner"></div>
            <span>Loading file system...</span>
          </div>
        `;
      }

      // Show error state
      showError(message) {
        this.container.innerHTML = `
          <div style="text-align: center; padding: 40px; color: #808080;">
            <div style="font-size: 32px; margin-bottom: 12px;">⚠️</div>
            <div>${message}</div>
          </div>
        `;
      }
    }

    // Initialize on page load
    document.addEventListener('DOMContentLoaded', async () => {
      showLoadingIndicator('Initializing file explorer...');

      const explorer = new FileExplorer();
      await explorer.init();

      hideLoadingIndicator();
    });

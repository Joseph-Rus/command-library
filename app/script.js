class CommandLibrary {
    constructor() {
        this.commands = [];
        this.selectedIndex = -1;
        this.filteredCommands = [];
        this.theme = this.loadTheme();
        
        this.initializeElements();
        this.bindEvents();
        this.applyTheme();
        this.initializeCommands();
        
        this.setupHotkeys();
    }

    async initializeCommands() {
        try {
            this.commands = await this.loadCommands();
            this.renderCommands();
        } catch (error) {
            console.error('Error initializing commands:', error);
        } finally {
            this.hideLoadingScreen();
        }
    }

    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loadingScreen');
        const mainContainer = document.getElementById('mainContainer');
        
        if (loadingScreen && mainContainer) {
            loadingScreen.classList.add('hidden');
            mainContainer.style.display = 'flex';
            
            setTimeout(() => {
                loadingScreen.style.display = 'none';
            }, 500);
        }
    }

    initializeElements() {
        this.searchInput = document.getElementById('searchInput');
        this.resultsContainer = document.getElementById('resultsContainer');
        this.settingsBtn = document.getElementById('settingsBtn');
        this.addBtn = document.getElementById('addBtn');
        this.settingsModal = document.getElementById('settingsModal');
        this.addModal = document.getElementById('addModal');
        this.themeSelect = document.getElementById('themeSelect');
        this.importFile = document.getElementById('importFile');
        
        this.commandName = document.getElementById('commandName');
        this.commandValue = document.getElementById('commandValue');
        this.commandDescription = document.getElementById('commandDescription');
        this.commandTags = document.getElementById('commandTags');
        this.saveCommand = document.getElementById('saveCommand');
        this.cancelAdd = document.getElementById('cancelAdd');
        
        // Transparency controls
        this.blurRange = document.getElementById('blurRange');
        this.blurValue = document.getElementById('blurValue');
        this.tintColor = document.getElementById('tintColor');
        this.tintPresets = document.getElementById('tintPresets');
        this.windowOpacityRange = document.getElementById('windowOpacityRange');
        this.windowOpacityValue = document.getElementById('windowOpacityValue');
        
        this.themeSelect.value = this.theme;
        this.loadTransparencySettings();
    }

    bindEvents() {
        this.searchInput.addEventListener('input', () => this.handleSearch());
        this.searchInput.addEventListener('keydown', (e) => this.handleKeyNavigation(e));
        
        if (this.settingsBtn) {
            this.settingsBtn.addEventListener('click', () => this.showModal('settings'));
        }
        if (this.addBtn) {
            this.addBtn.addEventListener('click', () => this.showModal('add'));
        }
        
        document.getElementById('closeSettings').addEventListener('click', () => this.hideModal('settings'));
        document.getElementById('closeAdd').addEventListener('click', () => this.hideModal('add'));
        
        this.themeSelect.addEventListener('change', () => this.changeTheme());
        this.importFile.addEventListener('change', () => this.importCommands());
        
        this.saveCommand.addEventListener('click', () => this.addCommand());
        this.cancelAdd.addEventListener('click', () => this.hideModal('add'));
        
        // Transparency controls
        if (this.blurRange) {
            this.blurRange.addEventListener('input', () => this.updateBlur());
        }
        if (this.tintColor) {
            this.tintColor.addEventListener('input', () => this.updateTint());
        }
        if (this.tintPresets) {
            this.tintPresets.addEventListener('change', () => this.updateTintFromPreset());
        }
        if (this.windowOpacityRange) {
            this.windowOpacityRange.addEventListener('input', () => this.updateWindowOpacity());
        }
        
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.hideModal('settings');
                this.hideModal('add');
            }
        });
    }

    setupHotkeys() {
        document.addEventListener('keydown', (e) => {
            if (e.metaKey || e.ctrlKey) {
                switch (e.key) {
                    case 'k':
                        e.preventDefault();
                        this.focusSearch();
                        break;
                    case 'n':
                        e.preventDefault();
                        this.showModal('add');
                        break;
                    case ',':
                        e.preventDefault();
                        this.showModal('settings');
                        break;
                }
            }
            
            if (e.key === 'Escape') {
                this.hideModal('settings');
                this.hideModal('add');
                this.clearSearch();
            }
        });
    }

    focusSearch() {
        this.searchInput.focus();
        this.searchInput.select();
    }

    clearSearch() {
        this.searchInput.value = '';
        this.handleSearch();
        this.searchInput.blur();
    }

    handleSearch() {
        const query = this.searchInput.value.trim();
        
        if (!query) {
            this.filteredCommands = this.commands;
        } else {
            this.filteredCommands = this.fuzzySearch(query, this.commands);
        }
        
        this.selectedIndex = this.filteredCommands.length > 0 ? 0 : -1;
        this.renderCommands();
    }

    fuzzySearch(query, commands) {
        const queryLower = query.toLowerCase();
        const results = [];

        for (const cmd of commands) {
            const scores = {
                name: this.calculateScore(queryLower, cmd.name.toLowerCase()),
                value: this.calculateScore(queryLower, cmd.value.toLowerCase()),
                description: this.calculateScore(queryLower, cmd.description.toLowerCase()),
                tags: Math.max(...cmd.tags.map(tag => this.calculateScore(queryLower, tag.toLowerCase())), 0)
            };

            // Calculate weighted total score
            const totalScore = (
                scores.name * 3.0 +      // Name has highest weight
                scores.value * 2.0 +     // Command value is important
                scores.description * 1.0 + // Description is helpful
                scores.tags * 2.5        // Tags are very relevant
            );

            // Only include results with meaningful scores
            if (totalScore > 0.1) {
                results.push({
                    ...cmd,
                    _searchScore: totalScore,
                    _matchHighlights: {
                        name: this.getHighlights(queryLower, cmd.name.toLowerCase()),
                        value: this.getHighlights(queryLower, cmd.value.toLowerCase()),
                        description: this.getHighlights(queryLower, cmd.description.toLowerCase()),
                        tags: cmd.tags.map(tag => this.getHighlights(queryLower, tag.toLowerCase()))
                    }
                });
            }
        }

        // Sort by score (highest first)
        return results.sort((a, b) => b._searchScore - a._searchScore);
    }

    calculateScore(query, text) {
        if (!text || !query) return 0;

        // Exact match gets highest score
        if (text === query) return 1.0;

        // Exact substring match gets high score
        if (text.includes(query)) {
            const position = text.indexOf(query);
            const lengthRatio = query.length / text.length;
            const positionBonus = 1 - (position / text.length * 0.5); // Earlier matches score higher
            return 0.8 * lengthRatio * positionBonus;
        }

        // Fuzzy matching with character sequence
        const fuzzyScore = this.fuzzyMatchScore(query, text);
        if (fuzzyScore > 0) return fuzzyScore * 0.6;

        // Word boundary matching
        const words = text.split(/\s+/);
        let wordMatchScore = 0;
        for (const word of words) {
            if (word.startsWith(query)) {
                wordMatchScore = Math.max(wordMatchScore, 0.7 * (query.length / word.length));
            } else if (word.includes(query)) {
                wordMatchScore = Math.max(wordMatchScore, 0.5 * (query.length / word.length));
            } else {
                // Typo tolerance using Levenshtein distance
                const editDistance = this.levenshteinDistance(query, word);
                const maxLength = Math.max(query.length, word.length);
                const similarity = 1 - (editDistance / maxLength);
                
                // Only consider close matches (similarity > 0.6) for typo tolerance
                if (similarity > 0.6 && editDistance <= 2) {
                    wordMatchScore = Math.max(wordMatchScore, 0.4 * similarity);
                }
            }
        }

        return wordMatchScore;
    }

    fuzzyMatchScore(query, text) {
        if (query.length === 0) return 0;
        if (text.length === 0) return 0;

        let queryIndex = 0;
        let textIndex = 0;
        let matches = 0;
        let consecutiveMatches = 0;
        let maxConsecutive = 0;

        while (queryIndex < query.length && textIndex < text.length) {
            if (query[queryIndex] === text[textIndex]) {
                matches++;
                consecutiveMatches++;
                maxConsecutive = Math.max(maxConsecutive, consecutiveMatches);
                queryIndex++;
            } else {
                consecutiveMatches = 0;
            }
            textIndex++;
        }

        if (matches === 0) return 0;

        const completionRatio = matches / query.length;
        const consecutiveBonus = maxConsecutive / query.length * 0.5;
        const lengthPenalty = Math.max(0, 1 - (text.length - query.length) / text.length * 0.2);

        return (completionRatio + consecutiveBonus) * lengthPenalty;
    }

    getHighlights(query, text) {
        if (!text || !query || !text.includes(query)) return [];
        
        const highlights = [];
        let searchFrom = 0;
        
        while (true) {
            const index = text.indexOf(query, searchFrom);
            if (index === -1) break;
            
            highlights.push({
                start: index,
                end: index + query.length
            });
            
            searchFrom = index + query.length;
        }
        
        return highlights;
    }

    levenshteinDistance(str1, str2) {
        const matrix = [];

        // Create empty matrix
        for (let i = 0; i <= str2.length; i++) {
            matrix[i] = [i];
        }

        for (let j = 0; j <= str1.length; j++) {
            matrix[0][j] = j;
        }

        // Fill matrix
        for (let i = 1; i <= str2.length; i++) {
            for (let j = 1; j <= str1.length; j++) {
                if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1, // substitution
                        matrix[i][j - 1] + 1,     // insertion
                        matrix[i - 1][j] + 1      // deletion
                    );
                }
            }
        }

        return matrix[str2.length][str1.length];
    }

    loadTransparencySettings() {
        const settings = this.getTransparencySettings();
        
        if (this.blurRange) {
            this.blurRange.value = settings.blur;
        }
        if (this.blurValue) {
            this.blurValue.textContent = `${settings.blur}px`;
        }
        
        if (this.tintColor) {
            this.tintColor.value = settings.tint;
        }
        
        if (this.windowOpacityRange) {
            this.windowOpacityRange.value = settings.windowOpacity;
        }
        if (this.windowOpacityValue) {
            this.windowOpacityValue.textContent = `${settings.windowOpacity}%`;
        }
        
        this.applyTransparencySettings(settings);
    }

    getTransparencySettings() {
        const stored = localStorage.getItem('transparencySettings');
        if (stored) {
            try {
                const settings = JSON.parse(stored);
                // Enforce minimum values for visibility
                return {
                    blur: Math.max(0, Math.min(50, settings.blur || 20)),
                    tint: settings.tint || '#000000',
                    windowOpacity: Math.max(70, Math.min(100, settings.windowOpacity || 90))
                };
            } catch (e) {
                console.error('Error loading transparency settings:', e);
            }
        }
        return {
            blur: 20,
            tint: '#000000',
            windowOpacity: 90
        };
    }

    saveTransparencySettings(settings) {
        localStorage.setItem('transparencySettings', JSON.stringify(settings));
    }

    updateBlur() {
        if (!this.blurRange) return;
        
        const blur = this.blurRange.value;
        if (this.blurValue) {
            this.blurValue.textContent = `${blur}px`;
        }
        
        const settings = this.getTransparencySettings();
        settings.blur = parseInt(blur);
        this.saveTransparencySettings(settings);
        this.applyTransparencySettings(settings);
    }


    updateTint() {
        if (!this.tintColor) return;
        
        const tint = this.tintColor.value;
        
        const settings = this.getTransparencySettings();
        settings.tint = tint;
        this.saveTransparencySettings(settings);
        this.applyTransparencySettings(settings);
    }

    updateTintFromPreset() {
        if (!this.tintPresets || !this.tintColor) return;
        
        const tint = this.tintPresets.value;
        this.tintColor.value = tint;
        this.updateTint();
    }

    updateWindowOpacity() {
        if (!this.windowOpacityRange) return;
        
        const windowOpacity = Math.max(70, parseInt(this.windowOpacityRange.value));
        if (this.windowOpacityValue) {
            this.windowOpacityValue.textContent = `${windowOpacity}%`;
        }
        
        const settings = this.getTransparencySettings();
        settings.windowOpacity = windowOpacity;
        this.saveTransparencySettings(settings);
        this.applyTransparencySettings(settings);
    }

    applyTransparencySettings(settings) {
        const container = document.querySelector('.container');
        if (container) {
            console.log('Applying transparency settings:', settings);
            console.log('Computed values:', {
                blur: `${settings.blur}px`
            });
            
            container.style.setProperty('--glass-blur', `${settings.blur}px`);
            
            // Force repaint
            container.style.display = 'none';
            container.offsetHeight; // Trigger reflow
            container.style.display = 'flex';
        }
        
        // Set window opacity via IPC
        if (typeof require !== 'undefined') {
            try {
                const { ipcRenderer } = require('electron');
                const windowOpacity = settings.windowOpacity / 100;
                ipcRenderer.send('set-window-opacity', windowOpacity);
            } catch (error) {
                console.log('Could not set window opacity:', error);
            }
        }
    }

    handleKeyNavigation(e) {
        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                if (this.selectedIndex < this.filteredCommands.length - 1) {
                    this.selectedIndex++;
                    this.updateSelection();
                }
                break;
            case 'ArrowUp':
                e.preventDefault();
                if (this.selectedIndex > 0) {
                    this.selectedIndex--;
                    this.updateSelection();
                }
                break;
            case 'Enter':
                e.preventDefault();
                if (this.selectedIndex >= 0 && this.filteredCommands[this.selectedIndex]) {
                    this.copyCommand(this.filteredCommands[this.selectedIndex]);
                }
                break;
        }
    }

    updateSelection() {
        const items = document.querySelectorAll('.command-item');
        items.forEach((item, index) => {
            item.classList.toggle('selected', index === this.selectedIndex);
        });
        
        if (this.selectedIndex >= 0) {
            const selectedItem = items[this.selectedIndex];
            if (selectedItem) {
                selectedItem.scrollIntoView({ block: 'nearest' });
            }
        }
    }

    renderCommands() {
        if (this.filteredCommands.length === 0) {
            this.resultsContainer.innerHTML = `
                <div class="empty-state">
                    <i class="bi bi-terminal"></i>
                    <p>${this.searchInput.value ? 'No commands found matching your search.' : 'No commands found. Add a new command to get started.'}</p>
                </div>
            `;
            return;
        }

        const html = this.filteredCommands.map((cmd, index) => `
            <div class="command-item ${index === this.selectedIndex ? 'selected' : ''}" data-index="${index}">
                <div class="command-header">
                    <div class="command-name">${this.highlightText(cmd.name, cmd._matchHighlights?.name)}</div>
                    <div class="command-actions">
                        ${cmd._searchScore ? `<span class="search-score" title="Relevance Score">${Math.round(cmd._searchScore * 100)}%</span>` : ''}
                        <button class="action-btn copy-btn" title="Copy Command">
                            <i class="bi bi-clipboard"></i>
                        </button>
                        <button class="action-btn delete-btn" title="Delete Command">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="command-value">${this.highlightText(cmd.value, cmd._matchHighlights?.value)}</div>
                ${cmd.description ? `<div class="command-description">${this.highlightText(cmd.description, cmd._matchHighlights?.description)}</div>` : ''}
                ${cmd.tags.length > 0 ? `
                    <div class="command-tags">
                        ${cmd.tags.map((tag, tagIndex) => `<span class="tag">${this.highlightText(tag, cmd._matchHighlights?.tags[tagIndex])}</span>`).join('')}
                    </div>
                ` : ''}
            </div>
        `).join('');

        this.resultsContainer.innerHTML = html;

        this.resultsContainer.addEventListener('click', (e) => {
            const commandItem = e.target.closest('.command-item');
            if (!commandItem) return;

            const index = parseInt(commandItem.dataset.index);
            const command = this.filteredCommands[index];

            if (e.target.closest('.copy-btn')) {
                this.copyCommand(command);
            } else if (e.target.closest('.delete-btn')) {
                this.deleteCommand(command.id);
            } else {
                this.selectedIndex = index;
                this.updateSelection();
                this.copyCommand(command);
            }
        });
    }

    copyCommand(command) {
        navigator.clipboard.writeText(command.value).then(() => {
            this.showCopyNotification(command.name);
        }).catch(() => {
            const textArea = document.createElement('textarea');
            textArea.value = command.value;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            this.showCopyNotification(command.name);
        });
    }

    showCopyNotification(commandName) {
        const statusDot = document.getElementById('statusDot');
        if (statusDot) {
            statusDot.classList.add('active');
            setTimeout(() => {
                statusDot.classList.remove('active');
            }, 1000);
        }
    }

    deleteCommand(id) {
        if (confirm('Are you sure you want to delete this command?')) {
            this.commands = this.commands.filter(cmd => cmd.id !== id);
            this.saveCommands();
            this.handleSearch();
        }
    }


    showModal(type) {
        if (type === 'settings') {
            this.settingsModal.classList.add('show');
        } else if (type === 'add') {
            this.clearAddForm();
            this.addModal.classList.add('show');
            setTimeout(() => this.commandName.focus(), 100);
        }
    }

    hideModal(type) {
        if (type === 'settings') {
            this.settingsModal.classList.remove('show');
        } else if (type === 'add') {
            this.addModal.classList.remove('show');
        }
    }

    clearAddForm() {
        this.commandName.value = '';
        this.commandValue.value = '';
        this.commandDescription.value = '';
        this.commandTags.value = '';
    }

    addCommand() {
        const name = this.commandName.value.trim();
        const value = this.commandValue.value.trim();
        const description = this.commandDescription.value.trim();
        const tags = this.commandTags.value.split(',').map(tag => tag.trim()).filter(tag => tag);

        if (!name || !value) {
            alert('Name and command are required.');
            return;
        }

        const newCommand = {
            id: Date.now().toString(),
            name,
            value,
            description,
            tags,
            createdAt: new Date().toISOString()
        };

        this.commands.push(newCommand);
        console.log(`➕ Added new command: "${newCommand.name}"`);
        this.saveCommands();
        this.hideModal('add');
        this.handleSearch();
    }

    changeTheme() {
        this.theme = this.themeSelect.value;
        this.applyTheme();
        this.saveTheme();
    }

    applyTheme() {
        document.body.setAttribute('data-theme', this.theme);
    }

    importCommands() {
        const file = this.importFile.files[0];
        if (!file) {
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const imported = JSON.parse(e.target.result);
                if (Array.isArray(imported)) {
                    const validCommands = imported.filter(cmd => 
                        cmd.name && cmd.value && typeof cmd.name === 'string' && typeof cmd.value === 'string'
                    ).map(cmd => ({
                        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                        name: cmd.name,
                        value: cmd.value,
                        description: cmd.description || '',
                        tags: Array.isArray(cmd.tags) ? cmd.tags : [],
                        createdAt: new Date().toISOString()
                    }));

                    this.commands.push(...validCommands);
                    this.saveCommands();
                    this.handleSearch();
                    alert(`Imported ${validCommands.length} commands successfully.`);
                } else {
                    alert('Invalid JSON format. Expected an array of commands.');
                }
            } catch (error) {
                alert('Error parsing JSON file: ' + error.message);
            }
            
            // Reset file input
            this.importFile.value = '';
        };
        reader.readAsText(file);
    }

    exportCommands() {
        const dataStr = JSON.stringify(this.commands, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `commands-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    async loadCommands() {
        try {
            const { ipcRenderer } = require('electron');
            const commands = await ipcRenderer.invoke('load-commands');
            if (commands && commands.length > 0) {
                console.log(`📁 Loaded ${commands.length} commands from file storage`);
                return commands;
            }
        } catch (error) {
            console.error('❌ Error loading commands from file:', error);
        }
        console.log('📝 No saved commands found, loading defaults');
        return this.getDefaultCommands();
    }

    async saveCommands() {
        try {
            const { ipcRenderer } = require('electron');
            const result = await ipcRenderer.invoke('save-commands', this.commands);
            if (result.success) {
                console.log(`✅ Saved ${this.commands.length} commands to file storage`);
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            console.error('❌ Failed to save commands:', error);
            alert('Failed to save commands: ' + error.message);
        }
    }

    loadTheme() {
        return localStorage.getItem('commandLibraryTheme') || 'dark';
    }

    saveTheme() {
        localStorage.setItem('commandLibraryTheme', this.theme);
    }

    getDefaultCommands() {
        return [
            {
                id: '1',
                name: 'Git Status',
                value: 'git status',
                description: 'Show the working tree status',
                tags: ['git', 'status'],
                createdAt: new Date().toISOString()
            },
            {
                id: '2',
                name: 'List Files',
                value: 'ls -la',
                description: 'List all files with details',
                tags: ['filesystem', 'list'],
                createdAt: new Date().toISOString()
            },
            {
                id: '3',
                name: 'Docker Compose Up',
                value: 'docker-compose up -d',
                description: 'Start services in detached mode',
                tags: ['docker', 'compose'],
                createdAt: new Date().toISOString()
            }
        ];
    }

    highlightText(text, highlights) {
        if (!highlights || highlights.length === 0) {
            return this.escapeHtml(text);
        }

        let result = '';
        let lastIndex = 0;

        // Sort highlights by start position
        const sortedHighlights = highlights.sort((a, b) => a.start - b.start);

        for (const highlight of sortedHighlights) {
            // Add text before highlight
            result += this.escapeHtml(text.substring(lastIndex, highlight.start));
            
            // Add highlighted text
            result += `<mark class="search-highlight">${this.escapeHtml(text.substring(highlight.start, highlight.end))}</mark>`;
            
            lastIndex = highlight.end;
        }

        // Add remaining text
        result += this.escapeHtml(text.substring(lastIndex));
        
        return result;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.commandLibrary = new CommandLibrary();
});
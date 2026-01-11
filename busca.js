// Sistema de Busca de Músicas

let allSongs = [];
let currentSort = { column: 0, direction: 'asc' };

document.addEventListener('DOMContentLoaded', function() {
    loadSongs();
    setupSearch();
    updateStats();
    
    // Adicionar missão ao carregar a página de busca
    const user = UserSystem.getCurrentUser();
    if (user && window.location.pathname.includes('busca.html')) {
        MissionSystem.completeMission('search_song');
    }
});

// Carregar músicas
function loadSongs() {
    allSongs = MusicStorage.getSongs();
    renderTable(allSongs);
}

// Configurar busca em tempo real
function setupSearch() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            filterSongs(searchTerm);
        });
    }
}

// Filtrar músicas
function filterSongs(searchTerm) {
    if (!searchTerm) {
        renderTable(allSongs);
        updateFilterInfo(allSongs.length, allSongs.length);
        return;
    }
    
    const filtered = allSongs.filter(song => {
        return song.name.toLowerCase().includes(searchTerm) ||
               song.album.toLowerCase().includes(searchTerm) ||
               song.artist.toLowerCase().includes(searchTerm);
    });
    
    renderTable(filtered);
    updateFilterInfo(filtered.length, allSongs.length);
}

// Atualizar informações do filtro
function updateFilterInfo(showing, total) {
    const filterInfo = document.getElementById('filterInfo');
    if (filterInfo) {
        filterInfo.textContent = `Mostrando ${showing} de ${total} músicas`;
    }
}

// Renderizar tabela
function renderTable(songs) {
    const tbody = document.getElementById('songsTableBody');
    if (!tbody) return;
    
    tbody.innerHTML = songs.map(song => {
        const daysToGoal = calculateDaysToGoal(song);
        const progress = Math.min(Math.round((song.totalStreams / song.goal) * 100), 100);
        
        return `
            <tr>
                <td>
                    <div class="song-name">
                        <i class="fas fa-music"></i>
                        <strong>${song.name}</strong>
                    </div>
                </td>
                <td>${song.album}</td>
                <td>
                    <span class="artist-badge ${song.artist === 'Selena Gomez' ? 'selena' : 'scene'}">
                        ${song.artist}
                    </span>
                </td>
                <td class="number-cell">${formatNumber(song.totalStreams)}</td>
                <td class="number-cell ${song.dailyStreams > 50000 ? 'highlight' : ''}">
                    ${formatNumber(song.dailyStreams)}
                </td>
                <td class="number-cell">${formatNumber(song.goal)}</td>
                <td class="number-cell ${daysToGoal < 30 ? 'warning' : ''}">
                    ${daysToGoal > 365 ? '>1 ano' : daysToGoal + ' dias'}
                </td>
                <td>
                    <div class="progress-container">
                        <div class="progress-bar-small">
                            <div class="progress-fill" style="width: ${progress}%"></div>
                        </div>
                        <span class="progress-text">${progress}%</span>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

// Calcular dias para meta
function calculateDaysToGoal(song) {
    if (!song.dailyStreams || song.dailyStreams <= 0) return 9999;
    
    const remaining = song.goal - song.totalStreams;
    const days = Math.ceil(remaining / song.dailyStreams);
    
    return Math.max(1, days);
}

// Ordenar tabela
function sortTable(columnIndex) {
    const tbody = document.getElementById('songsTableBody');
    const rows = Array.from(tbody.querySelectorAll('tr'));
    
    // Alternar direção
    if (currentSort.column === columnIndex) {
        currentSort.direction = currentSort.direction === 'asc' ? 'desc' : 'asc';
    } else {
        currentSort.column = columnIndex;
        currentSort.direction = 'asc';
    }
    
    // Atualizar setas
    updateSortArrows();
    
    // Ordenar linhas
    rows.sort((a, b) => {
        const aCell = a.cells[columnIndex].textContent;
        const bCell = b.cells[columnIndex].textContent;
        
        let aValue, bValue;
        
        // Converter para número se for numérico
        if (columnIndex >= 3 && columnIndex <= 6) {
            aValue = parseFloat(aCell.replace(/[^0-9.]/g, '')) || 0;
            bValue = parseFloat(bCell.replace(/[^0-9.]/g, '')) || 0;
        } else {
            aValue = aCell.toLowerCase();
            bValue = bCell.toLowerCase();
        }
        
        if (currentSort.direction === 'asc') {
            return aValue > bValue ? 1 : -1;
        } else {
            return aValue < bValue ? 1 : -1;
        }
    });
    
    // Reinserir linhas ordenadas
    rows.forEach(row => tbody.appendChild(row));
}

// Atualizar setas de ordenação
function updateSortArrows() {
    const headers = document.querySelectorAll('#songsTable th');
    headers.forEach((header, index) => {
        const arrow = header.querySelector('.sort-arrow');
        if (arrow) {
            arrow.innerHTML = '';
            if (index === currentSort.column) {
                arrow.innerHTML = currentSort.direction === 'asc' 
                    ? ' <i class="fas fa-arrow-up"></i>' 
                    : ' <i class="fas fa-arrow-down"></i>';
            }
        }
    });
}

// Limpar busca
function clearSearch() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.value = '';
        filterSongs('');
    }
}

// Atualizar estatísticas
function updateStats() {
    const songs = MusicStorage.getSongs();
    
    // Total de músicas
    document.getElementById('totalSongs').textContent = songs.length;
    
    // Total de streams
    const totalStreams = songs.reduce((sum, song) => sum + song.totalStreams, 0);
    document.getElementById('totalStreamsPage').textContent = formatNumber(totalStreams);
    
    // Meta média
    const avgGoal = Math.round(songs.reduce((sum, song) => sum + song.goal, 0) / songs.length);
    document.getElementById('avgGoal').textContent = formatNumber(avgGoal);
}

// Mostrar ranking
function showRanking() {
    window.location.href = 'index.html#ranking';
}

// Formatar número
function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
}

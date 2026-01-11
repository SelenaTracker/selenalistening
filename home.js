// Lógica específica da página Home

document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('albumsGrid')) {
        updateTopAlbums();
        updateFocusOfTheDay();
        updateRecentGoals();
        updateUserRanking();
    }
});

// Atualizar top álbuns
function updateTopAlbums() {
    const albumsGrid = document.getElementById('albumsGrid');
    if (!albumsGrid) return;
    
    const albums = JSON.parse(localStorage.getItem('selenaAlbums') || '{}');
    
    // Álbuns principais de Selena Gomez
    const mainAlbums = [
        { name: "Revival", icon: "fas fa-heart" },
        { name: "Rare Deluxe", icon: "fas fa-gem" },
        { name: "A Year Without Rain", icon: "fas fa-cloud" },
        { name: "Revelación", icon: "fas fa-fire" },
        { name: "I Said I Love You First...And You Said It Back", icon: "fas fa-comment-heart" },
        { name: "When The Sun Goes Down", icon: "fas fa-sun" },
        { name: "For You", icon: "fas fa-user-heart" },
        { name: "Kiss & Tell", icon: "fas fa-kiss-wink-heart" }
    ];
    
    albumsGrid.innerHTML = mainAlbums.map(album => {
        const albumData = albums[album.name] || { totalStreams: 0, dailyStreams: 0, songs: [] };
        
        return `
            <div class="album-card fade-in">
                <div class="album-header">
                    <div class="album-icon">
                        <i class="${album.icon}"></i>
                    </div>
                    <h3>${album.name}</h3>
                </div>
                <div class="album-stats">
                    <div class="album-stat">
                        <span>${formatNumber(albumData.totalStreams)}</span>
                        <small>Total</small>
                    </div>
                    <div class="album-stat">
                        <span>${formatNumber(albumData.dailyStreams)}</span>
                        <small>Hoje</small>
                    </div>
                </div>
                <p class="album-songs">
                    <small>${albumData.songs ? albumData.songs.length : 0} músicas</small>
                </p>
            </div>
        `;
    }).join('');
}

// Atualizar foco do dia
function updateFocusOfTheDay() {
    const votingResult = JSON.parse(localStorage.getItem('votingResult') || '{"winner": "A Year Without Rain", "votes": 1}');
    
    const songs = MusicStorage.getSongs();
    const focusSong = songs.find(song => song.name === votingResult.winner) || songs[0];
    
    // Atualizar elementos da página
    const focusSongElem = document.getElementById('focusSong');
    const focusStreamsElem = document.getElementById('focusStreams');
    const focusGoalElem = document.getElementById('focusGoal');
    const focusNeededElem = document.getElementById('focusNeeded');
    
    if (focusSongElem) focusSongElem.textContent = focusSong.name;
    if (focusStreamsElem) focusStreamsElem.textContent = formatNumber(focusSong.dailyStreams);
    if (focusGoalElem) focusGoalElem.textContent = formatNumber(focusSong.dailyGoal || 100000);
    
    const needed = Math.max(0, (focusSong.dailyGoal || 100000) - focusSong.dailyStreams);
    if (focusNeededElem) focusNeededElem.textContent = formatNumber(needed);
    
    // Atualizar link da playlist
    const playlistLink = localStorage.getItem('spotifyPlaylist') || 'https://open.spotify.com/playlist/37i9dQZF1DX4PP3DA4J0N8';
    const playlistBtn = document.getElementById('playlistBtn');
    if (playlistBtn) {
        playlistBtn.href = playlistLink;
    }
}

// Simular meta da música foco
function simulateFocusGoal() {
    const songs = MusicStorage.getSongs();
    const votingResult = JSON.parse(localStorage.getItem('votingResult') || '{"winner": "A Year Without Rain", "votes": 1}');
    const focusSong = songs.find(song => song.name === votingResult.winner);
    
    if (!focusSong) {
        alert('Música foco não encontrada!');
        return;
    }
    
    const currentStreams = focusSong.dailyStreams;
    const goal = focusSong.dailyGoal || 100000;
    const needed = goal - currentStreams;
    
    if (needed <= 0) {
        alert(`🎉 Meta já alcançada! ${focusSong.name} teve ${formatNumber(currentStreams)} streams hoje.`);
        return;
    }
    
    // Calcular tempo estimado baseado na média
    const averagePerHour = Math.round(currentStreams / (new Date().getHours() + 1));
    const hoursNeeded = Math.ceil(needed / averagePerHour);
    
    const simulation = `
        📊 SIMULAÇÃO PARA ${focusSong.name.toUpperCase()}:
        
        • Streams atuais: ${formatNumber(currentStreams)}
        • Meta diária: ${formatNumber(goal)}
        • Faltam: ${formatNumber(needed)}
        • Média por hora: ${formatNumber(averagePerHour)}
        • Tempo estimado: ${hoursNeeded} horas
        
        🎯 Dica: Compartilhe com amigos para acelerar!
    `;
    
    alert(simulation);
    
    // Adicionar pontos por usar simulação
    const user = UserSystem.getCurrentUser();
    if (user) {
        UserSystem.addPoints(1, 'use_calculator');
    }
}

// Atualizar ranking de usuários
function updateUserRanking() {
    const rankingBody = document.getElementById('rankingBody');
    if (!rankingBody) return;
    
    const ranking = JSON.parse(localStorage.getItem('userRanking') || '[]');
    
    if (ranking.length === 0) {
        rankingBody.innerHTML = `
            <tr>
                <td colspan="4" style="text-align: center; padding: 2rem;">
                    <i class="fas fa-users" style="font-size: 2rem; color: var(--text-secondary); margin-bottom: 1rem;"></i>
                    <p>Nenhum usuário no ranking ainda. Faça login e complete missões!</p>
                </td>
            </tr>
        `;
        return;
    }
    
    rankingBody.innerHTML = ranking.map((user, index) => {
        const positionClass = index < 3 ? `rank-${index + 1}` : '';
        const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '';
        
        return `
            <tr class="${positionClass}">
                <td>${index + 1} ${medal}</td>
                <td>${user.email.split('@')[0]}</td>
                <td>${user.points} pts</td>
                <td>${user.missionsCompleted || 0} missões</td>
            </tr>
        `;
    }).join('');
}

// Formatar número (redefinição para escopo local)
function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
}

// Sistema de Login

document.addEventListener('DOMContentLoaded', function() {
    const loginBtn = document.getElementById('loginBtn');
    const loginModal = document.getElementById('loginModal');
    const closeModal = document.querySelector('.close-modal');
    const loginForm = document.getElementById('loginForm');
    
    // Abrir modal de login
    if (loginBtn && loginModal) {
        loginBtn.addEventListener('click', function(e) {
            e.preventDefault();
            const user = UserSystem.getCurrentUser();
            
            if (user) {
                // Se já está logado, fazer logout
                if (confirm(`Deseja sair da conta ${user.email}?`)) {
                    UserSystem.logout();
                }
            } else {
                // Se não está logado, abrir modal
                loginModal.style.display = 'flex';
            }
        });
    }
    
    // Fechar modal
    if (closeModal && loginModal) {
        closeModal.addEventListener('click', () => {
            loginModal.style.display = 'none';
        });
    }
    
    // Fechar modal ao clicar fora
    window.addEventListener('click', (e) => {
        if (e.target === loginModal) {
            loginModal.style.display = 'none';
        }
    });
    
    // Processar login
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;
            
            if (!email || !password) {
                alert('Por favor, preencha todos os campos.');
                return;
            }
            
            // Validação simples de email
            if (!email.includes('@') || !email.includes('.')) {
                alert('Por favor, insira um email válido.');
                return;
            }
            
            // Verificar se usuário já existe
            let user = UserSystem.getUserByEmail(email);
            
            if (user) {
                // Verificar senha (simples para demonstração)
                if (user.password !== password) {
                    alert('Senha incorreta.');
                    return;
                }
            } else {
                // Criar novo usuário
                user = {
                    email: email,
                    password: password,
                    points: 0,
                    dailyMissions: {},
                    joinDate: new Date().toISOString()
                };
                UserSystem.saveUser(user);
            }
            
            // Fazer login
            UserSystem.setCurrentUser(user);
            
            // Adicionar pontos pelo login (se ainda não ganhou hoje)
            UserSystem.addPoints(1, 'daily_login');
            
            // Fechar modal e atualizar página
            loginModal.style.display = 'none';
            loginForm.reset();
            
            // Mostrar mensagem de boas-vindas
            alert(`🎉 Bem-vindo(a), ${email.split('@')[0]}! Você ganhou 1 ponto por fazer login!`);
            
            // Recarregar página para atualizar interface
            setTimeout(() => {
                window.location.reload();
            }, 500);
        });
    }
});

// Sistema de Pontos e Missões
class MissionSystem {
    static missions = {
        daily_login: {
            name: "Login diário",
            points: 1,
            description: "Faça login no site todos os dias"
        },
        use_calculator: {
            name: "Usar calculadora",
            points: 1,
            description: "Use a calculadora de metas"
        },
        search_song: {
            name: "Buscar música",
            points: 1,
            description: "Procure uma música na tabela de busca"
        },
        vote: {
            name: "Votar na música",
            points: 2,
            description: "Participe da votação diária"
        },
        listen_focus: {
            name: "Ouvir música foco",
            points: 2,
            description: "Ouça a música foco do dia"
        },
        listen_playlist: {
            name: "Ouvir playlist",
            points: 3,
            description: "Ouça nossa playlist no Spotify"
        }
    };
    
    static completeMission(missionKey) {
        const user = UserSystem.getCurrentUser();
        if (!user) {
            alert('Faça login para ganhar pontos!');
            return false;
        }
        
        const mission = this.missions[missionKey];
        if (!mission) {
            console.error('Missão não encontrada:', missionKey);
            return false;
        }
        
        const pointsEarned = UserSystem.addPoints(mission.points, missionKey);
        
        if (pointsEarned) {
            this.showMissionComplete(mission.name, mission.points, pointsEarned);
            return true;
        }
        
        return false;
    }
    
    static showMissionComplete(missionName, points, totalPoints) {
        const notification = document.createElement('div');
        notification.className = 'mission-notification fade-in';
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-trophy"></i>
                <div>
                    <h4>Missão completa!</h4>
                    <p>${missionName} - +${points} pontos</p>
                    <small>Total: ${totalPoints} pontos</small>
                </div>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Estilo da notificação
        notification.style.position = 'fixed';
        notification.style.top = '20px';
        notification.style.right = '20px';
        notification.style.background = 'var(--primary-color)';
        notification.style.color = 'white';
        notification.style.padding = '1rem';
        notification.style.borderRadius = 'var(--border-radius)';
        notification.style.zIndex = '3000';
        notification.style.boxShadow = 'var(--box-shadow)';
        notification.style.maxWidth = '300px';
        
        // Remover após 5 segundos
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 5000);
    }
    
    static getUserMissions() {
        const user = UserSystem.getCurrentUser();
        if (!user) return [];
        
        const today = new Date().toDateString();
        const completedMissions = user.dailyMissions || {};
        
        return Object.keys(this.missions).map(key => {
            const mission = this.missions[key];
            const completedToday = completedMissions[key] === today;
            
            return {
                key,
                name: mission.name,
                points: mission.points,
                description: mission.description,
                completed: completedToday,
                completedDate: completedMissions[key]
            };
        });
    }
}

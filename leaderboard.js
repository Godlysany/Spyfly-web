// ===================================================================
// LEADERBOARD INTERACTIVE FUNCTIONALITY - SPYFLY 2025
// ===================================================================

document.addEventListener('DOMContentLoaded', function() {
    initLeaderboardInteractivity();
});

function initLeaderboardInteractivity() {
    const periodButtons = document.querySelectorAll('.period-btn');
    const metricSelect = document.getElementById('metric-select');
    const leaderboardData = document.getElementById('leaderboard-data');

    // Sample data structure for different periods and metrics
    const leaderboardSampleData = {
        weekly: {
            pnl: [
                { rank: 1, username: '@crypto_wizard', pnl: '+$47,234', volume: '$892K', winrate: '94.2%', trades: 127, bestTrade: '+$12.4K', badge: 'premium' },
                { rank: 2, username: '@alpha_hunter', pnl: '+$38,967', volume: '$743K', winrate: '89.7%', trades: 94, bestTrade: '+$18.2K', badge: 'vip' },
                { rank: 3, username: '@moon_sniper', pnl: '+$31,785', volume: '$654K', winrate: '85.3%', trades: 108, bestTrade: '+$9.8K', badge: 'premium' },
                { rank: 4, username: '@degen_king', pnl: '+$28,432', volume: '$567K', winrate: '82.1%', trades: 85, bestTrade: '+$15.6K', badge: null },
                { rank: 5, username: '@fly_whisperer', pnl: '+$24,891', volume: '$498K', winrate: '78.9%', trades: 76, bestTrade: '+$11.2K', badge: 'vip' }
            ],
            volume: [
                { rank: 1, username: '@volume_king', pnl: '+$31,245', volume: '$1.2M', winrate: '76.4%', trades: 198, bestTrade: '+$8.9K', badge: 'vip' },
                { rank: 2, username: '@crypto_wizard', pnl: '+$47,234', volume: '$892K', winrate: '94.2%', trades: 127, bestTrade: '+$12.4K', badge: 'premium' },
                { rank: 3, username: '@whale_hunter', pnl: '+$22,876', volume: '$876K', winrate: '71.3%', trades: 156, bestTrade: '+$14.2K', badge: null },
                { rank: 4, username: '@alpha_hunter', pnl: '+$38,967', volume: '$743K', winrate: '89.7%', trades: 94, bestTrade: '+$18.2K', badge: 'vip' },
                { rank: 5, username: '@moon_sniper', pnl: '+$31,785', volume: '$654K', winrate: '85.3%', trades: 108, bestTrade: '+$9.8K', badge: 'premium' }
            ],
            winrate: [
                { rank: 1, username: '@precision_pro', pnl: '+$18,432', volume: '$284K', winrate: '97.8%', trades: 45, bestTrade: '+$7.2K', badge: 'premium' },
                { rank: 2, username: '@crypto_wizard', pnl: '+$47,234', volume: '$892K', winrate: '94.2%', trades: 127, bestTrade: '+$12.4K', badge: 'premium' },
                { rank: 3, username: '@snipe_master', pnl: '+$26,543', volume: '$398K', winrate: '92.1%', trades: 76, bestTrade: '+$9.1K', badge: 'vip' },
                { rank: 4, username: '@alpha_hunter', pnl: '+$38,967', volume: '$743K', winrate: '89.7%', trades: 94, bestTrade: '+$18.2K', badge: 'vip' },
                { rank: 5, username: '@accuracy_ace', pnl: '+$21,098', volume: '$312K', winrate: '87.9%', trades: 58, bestTrade: '+$6.8K', badge: null }
            ]
        },
        monthly: {
            pnl: [
                { rank: 1, username: '@legend_trader', pnl: '+$189,543', volume: '$3.2M', winrate: '91.4%', trades: 432, bestTrade: '+$28.7K', badge: 'premium' },
                { rank: 2, username: '@crypto_wizard', pnl: '+$167,892', volume: '$2.8M', winrate: '89.6%', trades: 387, bestTrade: '+$19.3K', badge: 'premium' },
                { rank: 3, username: '@alpha_hunter', pnl: '+$154,321', volume: '$2.4M', winrate: '87.2%', trades: 298, bestTrade: '+$32.1K', badge: 'vip' },
                { rank: 4, username: '@moon_sniper', pnl: '+$142,876', volume: '$2.1M', winrate: '85.7%', trades: 356, bestTrade: '+$15.9K', badge: 'premium' },
                { rank: 5, username: '@profit_machine', pnl: '+$128,654', volume: '$1.9M', winrate: '83.4%', trades: 289, bestTrade: '+$22.4K', badge: 'vip' }
            ],
            volume: [
                { rank: 1, username: '@volume_beast', pnl: '+$143,876', volume: '$4.1M', winrate: '79.3%', trades: 567, bestTrade: '+$18.2K', badge: 'vip' },
                { rank: 2, username: '@legend_trader', pnl: '+$189,543', volume: '$3.2M', winrate: '91.4%', trades: 432, bestTrade: '+$28.7K', badge: 'premium' },
                { rank: 3, username: '@crypto_wizard', pnl: '+$167,892', volume: '$2.8M', winrate: '89.6%', trades: 387, bestTrade: '+$19.3K', badge: 'premium' },
                { rank: 4, username: '@whale_slayer', pnl: '+$98,432', volume: '$2.6M', winrate: '74.1%', trades: 445, bestTrade: '+$21.8K', badge: null },
                { rank: 5, username: '@alpha_hunter', pnl: '+$154,321', volume: '$2.4M', winrate: '87.2%', trades: 298, bestTrade: '+$32.1K', badge: 'vip' }
            ],
            winrate: [
                { rank: 1, username: '@perfect_sniper', pnl: '+$87,234', volume: '$892K', winrate: '96.8%', trades: 154, bestTrade: '+$12.9K', badge: 'premium' },
                { rank: 2, username: '@accuracy_king', pnl: '+$76,543', volume: '$734K', winrate: '94.2%', trades: 128, bestTrade: '+$11.4K', badge: 'vip' },
                { rank: 3, username: '@legend_trader', pnl: '+$189,543', volume: '$3.2M', winrate: '91.4%', trades: 432, bestTrade: '+$28.7K', badge: 'premium' },
                { rank: 4, username: '@crypto_wizard', pnl: '+$167,892', volume: '$2.8M', winrate: '89.6%', trades: 387, bestTrade: '+$19.3K', badge: 'premium' },
                { rank: 5, username: '@alpha_hunter', pnl: '+$154,321', volume: '$2.4M', winrate: '87.2%', trades: 298, bestTrade: '+$32.1K', badge: 'vip' }
            ]
        },
        alltime: {
            pnl: [
                { rank: 1, username: '@goat_trader', pnl: '+$1,247,892', volume: '$18.3M', winrate: '88.7%', trades: 2134, bestTrade: '+$94.2K', badge: 'premium' },
                { rank: 2, username: '@alpha_legend', pnl: '+$987,543', volume: '$14.7M', winrate: '86.4%', trades: 1876, bestTrade: '+$67.8K', badge: 'premium' },
                { rank: 3, username: '@crypto_wizard', pnl: '+$856,321', volume: '$12.9M', winrate: '84.9%', trades: 1654, bestTrade: '+$48.3K', badge: 'premium' },
                { rank: 4, username: '@moon_emperor', pnl: '+$743,876', volume: '$11.2M', winrate: '82.1%', trades: 1432, bestTrade: '+$52.7K', badge: 'vip' },
                { rank: 5, username: '@profit_god', pnl: '+$692,543', volume: '$9.8M', winrate: '80.6%', trades: 1298, bestTrade: '+$39.4K', badge: 'premium' }
            ],
            volume: [
                { rank: 1, username: '@volume_titan', pnl: '+$743,210', volume: '$24.6M', winrate: '76.2%', trades: 3421, bestTrade: '+$34.1K', badge: 'vip' },
                { rank: 2, username: '@trade_machine', pnl: '+$654,789', volume: '$21.3M', winrate: '74.8%', trades: 2987, bestTrade: '+$28.9K', badge: null },
                { rank: 3, username: '@goat_trader', pnl: '+$1,247,892', volume: '$18.3M', winrate: '88.7%', trades: 2134, bestTrade: '+$94.2K', badge: 'premium' },
                { rank: 4, username: '@whale_destroyer', pnl: '+$532,167', volume: '$16.7M', winrate: '71.4%', trades: 2654, bestTrade: '+$41.2K', badge: 'vip' },
                { rank: 5, username: '@alpha_legend', pnl: '+$987,543', volume: '$14.7M', winrate: '86.4%', trades: 1876, bestTrade: '+$67.8K', badge: 'premium' }
            ],
            winrate: [
                { rank: 1, username: '@precision_lord', pnl: '+$432,890', volume: '$4.2M', winrate: '94.6%', trades: 756, bestTrade: '+$18.7K', badge: 'premium' },
                { rank: 2, username: '@snipe_god', pnl: '+$367,234', volume: '$3.8M', winrate: '92.8%', trades: 623, bestTrade: '+$15.2K', badge: 'vip' },
                { rank: 3, username: '@accuracy_master', pnl: '+$298,765', volume: '$3.1M', winrate: '91.4%', trades: 534, bestTrade: '+$12.9K', badge: 'premium' },
                { rank: 4, username: '@goat_trader', pnl: '+$1,247,892', volume: '$18.3M', winrate: '88.7%', trades: 2134, bestTrade: '+$94.2K', badge: 'premium' },
                { rank: 5, username: '@alpha_legend', pnl: '+$987,543', volume: '$14.7M', winrate: '86.4%', trades: 1876, bestTrade: '+$67.8K', badge: 'premium' }
            ]
        }
    };

    let currentPeriod = 'weekly';
    let currentMetric = 'pnl';

    // Period button event listeners
    periodButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            periodButtons.forEach(btn => btn.classList.remove('active'));
            // Add active class to clicked button
            this.classList.add('active');
            
            currentPeriod = this.dataset.period;
            updateLeaderboard();
        });
    });

    // Metric selector event listener
    if (metricSelect) {
        metricSelect.addEventListener('change', function() {
            currentMetric = this.value;
            updateLeaderboard();
        });
    }

    // Function to update leaderboard table
    function updateLeaderboard() {
        const data = leaderboardSampleData[currentPeriod][currentMetric];
        
        if (leaderboardData && data) {
            leaderboardData.innerHTML = '';
            
            data.forEach((trader, index) => {
                const row = document.createElement('tr');
                const rankClass = index < 3 ? `rank-${index + 1}` : '';
                row.className = rankClass;
                
                const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '';
                const medalSpan = medal ? `<span class="rank-medal">${medal}</span> ` : '';
                
                const badgeHtml = trader.badge ? `<span class="badge ${trader.badge}">${trader.badge === 'premium' ? 'GENESIS' : 'VIP'}</span>` : '';
                
                const winrateClass = parseFloat(trader.winrate) >= 90 ? 'excellent' : 
                                   parseFloat(trader.winrate) >= 80 ? 'good' : 'average';
                
                row.innerHTML = `
                    <td>${medalSpan}${trader.rank}</td>
                    <td class="trader-cell">
                        <div class="trader-info">
                            <span class="username">${trader.username}</span>
                            ${badgeHtml}
                        </div>
                    </td>
                    <td class="pnl positive">${trader.pnl}</td>
                    <td class="volume">${trader.volume}</td>
                    <td class="winrate ${winrateClass}">${trader.winrate}</td>
                    <td>${trader.trades}</td>
                    <td class="best-trade">${trader.bestTrade}</td>
                `;
                
                leaderboardData.appendChild(row);
            });
        }
    }

    // Auto-refresh leaderboard every 30 seconds
    setInterval(() => {
        // In real implementation, this would fetch fresh data from API
        updateLeaderboard();
        
        // Add visual indication of refresh
        const liveIndicator = document.querySelector('.live-dot');
        if (liveIndicator) {
            liveIndicator.style.animation = 'none';
            liveIndicator.offsetHeight; // Trigger reflow
            liveIndicator.style.animation = 'pulse 2s infinite';
        }
    }, 30000);

    // Initialize with default view
    updateLeaderboard();
    
    // Initialize Prize Hub
    initPrizeHub();
}

// Prize Hub Initialization
async function initPrizeHub() {
    try {
        // Fetch from database API
        const response = await fetch('/api/prizes');
        const prizeData = await response.json();
        
        // Compute automatic states from dates
        prizeData.current = computePrizeState(prizeData.current);
        prizeData.upcoming = computePrizeState(prizeData.upcoming);
        
        updateCurrentPrizeSection(prizeData);
        updateFuturePrizesSection(prizeData);
        updateHistoricImpactSection(prizeData);
        
    } catch (error) {
        console.log('Prize Hub initialization failed:', error);
    }
}

function updateCurrentPrizeSection(data) {
    const section = document.getElementById('current-prize-section');
    const title = document.getElementById('current-prize-title');
    const pool = document.getElementById('current-prize-pool');
    const countdown = document.getElementById('current-prize-countdown');
    const breakdown = document.getElementById('current-prize-breakdown');
    
    if (!section || !data.current) return;
    
    const current = data.current;
    
    title.textContent = current.title;
    pool.textContent = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(current.prize_pool_usd);
    
    // Generate breakdown
    if (current.prize_breakdown && current.prize_breakdown.length > 0) {
        breakdown.innerHTML = current.prize_breakdown.map(item => `
            <div class="breakdown-item">
                <div class="breakdown-place">${item.place}${getPlaceSuffix(item.place)}</div>
                <div class="breakdown-amount">$${item.amount_usd.toLocaleString()}</div>
            </div>
        `).join('');
    } else {
        // Show default breakdown if none configured
        breakdown.innerHTML = `
            <div class="breakdown-item">
                <div class="breakdown-place">1st</div>
                <div class="breakdown-amount">$${Math.floor(current.prize_pool_usd * 0.5).toLocaleString()}</div>
            </div>
            <div class="breakdown-item">
                <div class="breakdown-place">2nd</div>
                <div class="breakdown-amount">$${Math.floor(current.prize_pool_usd * 0.3).toLocaleString()}</div>
            </div>
            <div class="breakdown-item">
                <div class="breakdown-place">3rd</div>
                <div class="breakdown-amount">$${Math.floor(current.prize_pool_usd * 0.2).toLocaleString()}</div>
            </div>
        `;
    }
    
    // Start countdown
    const endDate = new Date(current.end_date);
    updatePrizeCountdown(countdown, endDate);
    
    section.style.display = 'block';
}

function updateFuturePrizesSection(data) {
    const section = document.getElementById('future-prizes-section');
    const container = document.getElementById('future-prizes-container');
    
    if (!section || !data.upcoming) return;
    
    const upcoming = data.upcoming;
    container.innerHTML = `
        <div class="future-prize-card">
            <h4>${upcoming.title}</h4>
            <div class="future-pool">$${upcoming.prize_pool_usd.toLocaleString()} Prize Pool</div>
            <div class="future-start">Starts ${new Date(upcoming.start_date).toLocaleDateString()}</div>
            <a href="${upcoming.cta_link}" class="btn btn-secondary">${upcoming.cta_text}</a>
        </div>
    `;
    
    section.style.display = 'block';
}

function updateHistoricImpactSection(data) {
    const totalDistributed = document.getElementById('total-distributed');
    const totalWinners = document.getElementById('total-winners');
    const monthsActive = document.getElementById('months-active');
    const carousel = document.getElementById('winners-carousel');
    
    if (!data.stats) return;
    
    totalDistributed.textContent = `$${data.stats.total_distributed_usd.toLocaleString()}`;
    totalWinners.textContent = data.stats.total_winners;
    monthsActive.textContent = data.stats.months_active;
    
    // Generate winners carousel
    if (data.history && carousel) {
        const allWinners = data.history.flatMap(competition => 
            competition.winners ? competition.winners.map(winner => ({
                ...winner,
                period: competition.period,
                competition_title: competition.title
            })) : []
        );
        
        carousel.innerHTML = allWinners.map(winner => `
            <div class="winner-card">
                <div class="winner-rank">${getPlaceEmoji(winner.place)}</div>
                <div class="winner-username">${winner.username}</div>
                <div class="winner-amount">$${winner.amount_usd.toLocaleString()}</div>
                <div class="winner-period">${winner.period}</div>
                ${winner.tx_url ? `<div class="winner-proof"><a href="${winner.tx_url}" target="_blank">View Transaction</a></div>` : ''}
            </div>
        `).join('');
    }
}

function updatePrizeCountdown(element, endDate) {
    function update() {
        const now = new Date();
        const diff = endDate - now;
        
        if (diff <= 0) {
            element.textContent = 'Competition Ended';
            return;
        }
        
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        
        element.textContent = `${days}d ${hours}h ${minutes}m`;
    }
    
    update();
    setInterval(update, 60000); // Update every minute
}

function getPlaceSuffix(place) {
    if (typeof place === 'string') return '';
    const lastDigit = place % 10;
    const lastTwoDigits = place % 100;
    
    if (lastTwoDigits >= 11 && lastTwoDigits <= 13) return 'th';
    if (lastDigit === 1) return 'st';
    if (lastDigit === 2) return 'nd';
    if (lastDigit === 3) return 'rd';
    return 'th';
}

function getPlaceEmoji(place) {
    if (place === 1) return '🥇';
    if (place === 2) return '🥈';
    if (place === 3) return '🥉';
    return `#${place}`;
}

// Compute prize state automatically from dates (duplicate for leaderboard page)
function computePrizeState(prize) {
    if (!prize) return prize;
    
    const now = new Date();
    const startDate = new Date(prize.start_date);
    const endDate = new Date(prize.end_date);
    
    // Auto-compute status from dates (ignore manual status)
    if (now >= startDate && now <= endDate) {
        prize.computed_status = 'active';
    } else if (now < startDate) {
        prize.computed_status = 'upcoming';
    } else {
        prize.computed_status = 'ended';
    }
    
    return prize;
}
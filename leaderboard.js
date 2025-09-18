// ===================================================================
// LEADERBOARD INTERACTIVE FUNCTIONALITY - SPYFLY 2025
// SMART VIEW SYSTEM: Launch View → Sophisticated View
// ===================================================================

document.addEventListener('DOMContentLoaded', function() {
    initLeaderboardInteractivity();
    initSmartPrizeHub();
    initViewTester();
});

// ===================================================================
// VIEW TESTING INTERFACE - FOR VERIFICATION ONLY
// ===================================================================
function initViewTester() {
    // Add view tester only if URL contains ?test=views
    if (window.location.search.includes('test=views')) {
        addViewTesterInterface();
    }
}

function addViewTesterInterface() {
    const tester = document.createElement('div');
    tester.innerHTML = `
        <div style="position: fixed; top: 10px; right: 10px; z-index: 9999; background: rgba(0,0,0,0.9); border: 2px solid #2DD47F; border-radius: 10px; padding: 15px;">
            <div style="color: #2DD47F; font-weight: bold; margin-bottom: 10px;">🧪 VIEW TESTER</div>
            <button onclick="testLaunchView()" style="background: #2DD47F; color: black; border: none; padding: 8px 12px; margin: 5px; border-radius: 5px; cursor: pointer;">🚀 Launch</button>
            <button onclick="testTransitionView()" style="background: #9945ff; color: white; border: none; padding: 8px 12px; margin: 5px; border-radius: 5px; cursor: pointer;">🔄 Transition</button>
            <button onclick="testSophisticatedView()" style="background: #FFD700; color: black; border: none; padding: 8px 12px; margin: 5px; border-radius: 5px; cursor: pointer;">💎 Sophisticated</button>
            <button onclick="testRealData()" style="background: #ffffff; color: black; border: none; padding: 8px 12px; margin: 5px; border-radius: 5px; cursor: pointer;">📊 Real Data</button>
            <button onclick="testSimple()" style="background: #ff0000; color: white; border: none; padding: 8px 12px; margin: 5px; border-radius: 5px; cursor: pointer;">🔧 Simple Test</button>
        </div>
    `;
    document.body.appendChild(tester);
}

// Test Functions
window.testLaunchView = function() {
    console.log('🚀 Testing Launch View');
    const prizeHub = document.getElementById('prize-hub');
    console.log('Found prize-hub element:', !!prizeHub);
    if (prizeHub) {
        console.log('Current innerHTML length:', prizeHub.innerHTML.length);
        console.log('About to call renderLaunchView...');
        renderLaunchView();
        console.log('After renderLaunchView, innerHTML length:', prizeHub.innerHTML.length);
        console.log('Contains launch-hero-card:', prizeHub.innerHTML.includes('launch-hero-card'));
    }
}

window.testTransitionView = function() {
    console.log('🔄 Testing Transition View');
    const prizeHub = document.getElementById('prize-hub');
    console.log('Found prize-hub element:', !!prizeHub);
    const mockTransitionData = {
        current: {
            title: 'September Championship',
            prize_pool_usd: 15000
        },
        upcoming: null,
        history: [],
        stats: { total_winners: 0, total_distributed_usd: 0 }
    };
    renderTransitionView(mockTransitionData);
}

window.testSophisticatedView = function() {
    console.log('💎 Testing Sophisticated View');
    const prizeHub = document.getElementById('prize-hub');
    console.log('Found prize-hub element:', !!prizeHub);
    const mockRichData = {
        current: {
            id: '1',
            title: 'September Championship',
            prize_pool_usd: 15000,
            start_date: '2025-09-15T00:00:00Z',
            end_date: '2025-09-30T23:59:59Z',
            highlight_copy: '🔥 $15K Prize Pool - Ends This Month!',
            cta_text: 'JOIN COMPETITION',
            cta_link: '#'
        },
        upcoming: {
            title: 'October Mega Championship',
            prize_pool_usd: 25000
        },
        history: [
            {
                username: 'cryptowizard',
                place: 1,
                amount_usd: 7500,
                competition_title: 'August Championship',
                paid_at: '2025-08-31'
            },
            {
                username: 'alphahunter',
                place: 2, 
                amount_usd: 4500,
                competition_title: 'August Championship',
                paid_at: '2025-08-31'
            }
        ],
        stats: {
            total_winners: 12,
            total_distributed_usd: 45000,
            months_active: 3
        }
    };
    renderSophisticatedView(mockRichData);
}

window.testRealData = function() {
    console.log('📊 Testing Real Data (resetting to actual API)');
    initSmartPrizeHub();
}

window.testSimple = function() {
    console.log('🔧 Simple Test - Direct DOM Manipulation');
    const prizeHub = document.getElementById('prize-hub');
    if (prizeHub) {
        console.log('Element found, setting simple test content...');
        prizeHub.innerHTML = '<div style="background: red; color: white; padding: 20px; text-align: center;"><h1>🔧 SIMPLE TEST WORKS!</h1><p>This proves DOM manipulation is working</p></div>';
        console.log('Simple test content set!');
    } else {
        console.log('ERROR: Could not find prize-hub element!');
    }
}

// ===================================================================
// SMART PRIZE HUB - LAUNCH VS SOPHISTICATED VIEW
// ===================================================================
async function initSmartPrizeHub() {
    try {
        const response = await fetch('/api/prizes');
        const data = await response.json();
        
        // Detect data richness to choose view
        const hasCompetitions = data.current || data.upcoming;
        const hasHistory = data.history && data.history.length > 0;
        const hasStats = data.stats && data.stats.total_winners > 0;
        
        if (!hasCompetitions && !hasHistory && !hasStats) {
            renderLaunchView();
        } else if (hasCompetitions && hasHistory && hasStats) {
            renderSophisticatedView(data);
        } else {
            renderTransitionView(data);
        }
    } catch (error) {
        console.log('API not available, using launch view');
        renderLaunchView();
    }
}

function renderLaunchView() {
    const prizeHub = document.getElementById('prize-hub');
    prizeHub.innerHTML = `
        <div class="container">
            <h1 class="section-title">🏆 Prize Championships</h1>
            
            <!-- Launch Hero -->
            <div class="launch-hero-card">
                <div class="launch-hero-content">
                    <div class="launch-badge">🚀 LAUNCHING SOON</div>
                    <h2 class="launch-title">The Ultimate Trading Championship</h2>
                    <p class="launch-subtitle">Compete with elite traders. Win life-changing prizes. Prove your alpha.</p>
                    
                    <div class="launch-features">
                        <div class="launch-feature">
                            <i class="fas fa-trophy"></i>
                            <div>
                                <strong>Massive Prize Pools</strong>
                                <span>$15K+ monthly competitions</span>
                            </div>
                        </div>
                        <div class="launch-feature">
                            <i class="fas fa-chart-line"></i>
                            <div>
                                <strong>Real Performance</strong>
                                <span>Track actual P&L and win rates</span>
                            </div>
                        </div>
                        <div class="launch-feature">
                            <i class="fas fa-users"></i>
                            <div>
                                <strong>Elite Community</strong>
                                <span>Compete with top Solana traders</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="launch-cta">
                        <a href="https://t.me/spyflybot" class="btn btn-primary btn-large">
                            🎯 GET EARLY ACCESS
                        </a>
                        <p class="launch-note">Be among the first competitors when we launch</p>
                    </div>
                </div>
                
                <div class="launch-visual">
                    <div class="launch-stats-preview">
                        <div class="stat-item">
                            <div class="stat-number">$50K+</div>
                            <div class="stat-label">Prize Pool Ready</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-number">24/7</div>
                            <div class="stat-label">Real-time Tracking</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-number">1st</div>
                            <div class="stat-label">On Solana</div>
                        </div>
                    </div>
                    
                    <div class="launch-preview-leaderboard">
                        <div class="preview-title">Live Leaderboard Preview</div>
                        <div class="preview-row preview-winner">
                            <span>🥇 @your_username</span>
                            <span class="preview-pnl">+$47.2K</span>
                        </div>
                        <div class="preview-row">
                            <span>🥈 @trader_legend</span>
                            <span class="preview-pnl">+$38.9K</span>
                        </div>
                        <div class="preview-row">
                            <span>🥉 @alpha_hunter</span>
                            <span class="preview-pnl">+$31.5K</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Coming Soon Features -->
            <div class="coming-soon-section">
                <h3 class="subsection-title">What's Coming</h3>
                <div class="coming-soon-grid">
                    <div class="coming-soon-card">
                        <i class="fas fa-calendar-alt"></i>
                        <h4>Monthly Championships</h4>
                        <p>Regular competitions with increasing prize pools</p>
                    </div>
                    <div class="coming-soon-card">
                        <i class="fas fa-medal"></i>
                        <h4>Instant Payouts</h4>
                        <p>Winners receive prizes directly to their wallets</p>
                    </div>
                    <div class="coming-soon-card">
                        <i class="fas fa-shield-alt"></i>
                        <h4>Verified Trades</h4>
                        <p>100% transparent, on-chain verification system</p>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function renderTransitionView(data) {
    // Mixed view - some data exists but not full sophisticated view yet
    const prizeHub = document.getElementById('prize-hub');
    const hasCompetitions = data.current || data.upcoming;
    const hasHistory = data.history && data.history.length > 0;
    
    let content = '<div class="container"><h1 class="section-title">🏆 Prize Championships</h1>';
    
    if (hasCompetitions) {
        content += renderCompetitionSection(data);
    } else {
        content += renderUpcomingPromise();
    }
    
    if (hasHistory) {
        content += renderHistorySection(data);
    } else {
        content += renderHistoryPreview();
    }
    
    content += '</div>';
    prizeHub.innerHTML = content;
}

// Sophisticated view renderer for rich data
function renderSophisticatedView(data) {
    const prizeHub = document.getElementById('prize-hub');
    prizeHub.innerHTML = `
        <div class="container">
            <h1 class="section-title">🏆 Prize Championships</h1>
            
            <!-- Current Live Competition -->
            <div class="sophisticated-current">
                <div class="current-prize-card">
                    <div class="prize-header">
                        <h2>${data.current.title}</h2>
                        <div class="prize-badges">
                            <span class="prize-badge live">🔴 LIVE</span>
                            <span class="prize-badge monthly">MONTHLY</span>
                        </div>
                    </div>
                    <div class="prize-pool">
                        <div class="pool-amount">$${data.current.prize_pool_usd.toLocaleString()}</div>
                        <div class="pool-label">Total Prize Pool</div>
                    </div>
                    <div class="prize-countdown-container">
                        <div class="countdown-label">Competition Ends In:</div>
                        <div class="countdown-timer">12d 14h 23m</div>
                    </div>
                    <div class="prize-actions">
                        <a href="${data.current.cta_link || '#'}" class="btn btn-primary btn-large">
                            ${data.current.cta_text || 'JOIN COMPETITION'}
                        </a>
                        <div class="eligibility-note">Min 50 trades • $10K volume</div>
                    </div>
                </div>
            </div>

            <!-- Upcoming Competitions -->
            ${data.upcoming ? `
            <div class="sophisticated-upcoming">
                <h3 class="subsection-title">Next Championship</h3>
                <div class="upcoming-card">
                    <h4>${data.upcoming.title}</h4>
                    <div class="upcoming-pool">$${data.upcoming.prize_pool_usd.toLocaleString()}</div>
                    <p>Registration opens soon</p>
                </div>
            </div>
            ` : ''}

            <!-- Rich Historical Impact -->
            <div class="sophisticated-history">
                <h3 class="subsection-title">Champion Hall of Fame</h3>
                <div class="history-stats">
                    <div class="stat-card">
                        <div class="stat-value">$${data.stats.total_distributed_usd.toLocaleString()}</div>
                        <div class="stat-label">Total Distributed</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${data.stats.total_winners}</div>
                        <div class="stat-label">Champions</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${data.stats.months_active}</div>
                        <div class="stat-label">Months Active</div>
                    </div>
                </div>
                
                <div class="winners-grid">
                    ${data.history.slice(0, 6).map(winner => `
                        <div class="winner-card">
                            <div class="winner-place">#${winner.place}</div>
                            <div class="winner-name">${winner.username}</div>
                            <div class="winner-prize">$${winner.amount_usd.toLocaleString()}</div>
                            <div class="winner-competition">${winner.competition_title}</div>
                            <div class="winner-date">${new Date(winner.paid_at).toLocaleDateString()}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
}

function renderUpcomingPromise() {
    return `
        <div class="transition-promise">
            <div class="promise-card">
                <i class="fas fa-rocket"></i>
                <h3>First Championship Loading...</h3>
                <p>We're preparing an epic competition with massive prizes. Early access members will be notified first!</p>
                <a href="https://t.me/spyflybot" class="btn btn-primary">🔔 Get Notified</a>
            </div>
        </div>
    `;
}

function renderHistoryPreview() {
    return `
        <div class="history-preview-section">
            <h3 class="subsection-title">Hall of Champions</h3>
            <div class="history-preview">
                <div class="preview-card">
                    <i class="fas fa-crown"></i>
                    <h4>Make History</h4>
                    <p>Be the first name in our Hall of Champions. Your trading skills could earn you legendary status.</p>
                </div>
                <div class="preview-benefits">
                    <div class="benefit-item">✅ Permanent leaderboard recognition</div>
                    <div class="benefit-item">✅ Winner spotlight & interview</div>
                    <div class="benefit-item">✅ Exclusive champion badge</div>
                </div>
            </div>
        </div>
    `;
}

function renderCompetitionSection(data) {
    // Render current/upcoming competitions
    const competition = data.current || data.upcoming;
    const isLive = !!data.current;
    
    return `
        <div class="competition-active">
            <div class="competition-card">
                <div class="competition-header">
                    <h3>${isLive ? '🔴 Live Competition' : '🔜 Next Competition'}</h3>
                    ${isLive ? '<span class="live-badge">ACTIVE</span>' : '<span class="upcoming-badge">COMING SOON</span>'}
                </div>
                <div class="competition-details">
                    <h4>${competition.title}</h4>
                    <div class="competition-prize">$${competition.prize_pool_usd.toLocaleString()}</div>
                    <div class="competition-actions">
                        <a href="https://t.me/spyflybot" class="btn btn-primary">
                            ${isLive ? 'JOIN NOW' : 'GET NOTIFIED'}
                        </a>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function renderHistorySection(data) {
    // Render actual historical data
    return `
        <div class="history-rich">
            <h3 class="subsection-title">Recent Champions</h3>
            <div class="winners-showcase">
                ${data.history.slice(0, 3).map(winner => `
                    <div class="champion-card">
                        <div class="champion-place">${getPlaceEmoji(winner.place)}</div>
                        <div class="champion-name">@${winner.username}</div>
                        <div class="champion-prize">$${winner.amount_usd.toLocaleString()}</div>
                        <div class="champion-competition">${winner.competition_title}</div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

function getPlaceEmoji(place) {
    if (place === 1) return '🥇';
    if (place === 2) return '🥈'; 
    if (place === 3) return '🥉';
    return `#${place}`;
}

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

    // The sophisticated view function is now defined globally


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
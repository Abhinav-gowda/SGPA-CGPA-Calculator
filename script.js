// Enhanced Academic Performance Calculator with Reactive Features
document.addEventListener('DOMContentLoaded', function() {
    // Initialize variables
    let semesterCounter = 1;
    let semesterData = [];
    let chart = null;
    let lastCGPA = 0;
    let achievements = [];
    
    // New variables for improvements
    let lastSubjectCount = localStorage.getItem('lastSubjectCount') || 5;
    let userPreferredSubjects = localStorage.getItem('preferredSubjects') || 5;
    let isFirstVisit = localStorage.getItem('firstVisit') === null;
    
    // DOM Elements
    const semestersContainer = document.getElementById('semestersContainer');
    const addSemesterBtn = document.getElementById('addSemesterBtn');
    const saveDataBtn = document.getElementById('saveDataBtn');
    const loadDataBtn = document.getElementById('loadDataBtn');
    const resetDataBtn = document.getElementById('resetDataBtn');
    const sgpaDisplay = document.getElementById('sgpaDisplay');
    const cgpaDisplay = document.getElementById('cgpaDisplay');
    const sgpaCircle = document.getElementById('sgpaCircle');
    const cgpaCircle = document.getElementById('cgpaCircle');
    const sgpaText = document.getElementById('sgpaText');
    const cgpaText = document.getElementById('cgpaText');
    const performanceStatus = document.getElementById('performanceStatus');
    const statusIcon = document.getElementById('statusIcon');
    const statusText = document.getElementById('statusText');
    const statusDescription = document.getElementById('statusDescription');
    const achievementNotification = document.getElementById('achievementNotification');
    const achievementTitle = document.getElementById('achievementTitle');
    const achievementText = document.getElementById('achievementText');
    const onboardingModal = document.getElementById('onboardingModal');
    const templateModal = document.getElementById('templateModal');
    const closeOnboarding = document.getElementById('closeOnboarding');
    const skipTemplate = document.getElementById('skipTemplate');
    
    // Constants for circle calculations
    const CIRCUMFERENCE = 2 * Math.PI * 40;
    const MAX_OFFSET = CIRCUMFERENCE;
    
    // Achievement system
    const achievementsList = [
        { id: 'first_grade', name: 'First Step', description: 'Added your first grade!', condition: () => getTotalSubjects() >= 1 },
        { id: 'perfect_semester', name: 'Perfect Score!', description: 'Achieved 10.0 SGPA in a semester!', condition: () => getCurrentSGPA() === 10 },
        { id: 'excellent_cgpa', name: 'Excellence!', description: 'Achieved CGPA above 9.0!', condition: () => getCurrentCGPA() > 9 },
        { id: 'good_cgpa', name: 'Good Performance!', description: 'Achieved CGPA above 8.0!', condition: () => getCurrentCGPA() > 8 },
        { id: 'five_semesters', name: 'Persistence!', description: 'Completed 5 semesters!', condition: () => semesterData.length >= 5 },
        { id: 'improved_cgpa', name: 'Improvement!', description: 'Improved your CGPA!', condition: () => getCurrentCGPA() > lastCGPA },
    ];
    
    // Academic templates
    const templates = {
        engineering: [
            { name: "Mathematics", credits: 4 },
            { name: "Physics", credits: 4 },
            { name: "Chemistry", credits: 3 },
            { name: "Programming", credits: 4 },
            { name: "Engineering Drawing", credits: 3 },
            { name: "Electronics", credits: 3 }
        ],
        business: [
            { name: "Accounting", credits: 3 },
            { name: "Economics", credits: 3 },
            { name: "Marketing", credits: 3 },
            { name: "Management", credits: 3 },
            { name: "Finance", credits: 3 },
            { name: "Business Law", credits: 3 }
        ],
        arts: [
            { name: "Literature", credits: 3 },
            { name: "History", credits: 3 },
            { name: "Philosophy", credits: 3 },
            { name: "Sociology", credits: 3 },
            { name: "Political Science", credits: 3 },
            { name: "Fine Arts", credits: 3 }
        ]
    };
    
    // Initialize onboarding
    if (isFirstVisit) {
        onboardingModal.classList.remove('hidden');
        localStorage.setItem('firstVisit', 'completed');
    } else {
        onboardingModal.classList.add('hidden');
    }
    
    // Close onboarding modal
    closeOnboarding.addEventListener('click', () => {
        onboardingModal.classList.add('hidden');
        templateModal.classList.remove('hidden');
    });
    
    // Template selection
    document.querySelectorAll('#templateModal button[data-template]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const template = e.currentTarget.dataset.template;
            loadTemplate(template);
            templateModal.classList.add('hidden');
        });
    });
    
    // Skip template
    skipTemplate.addEventListener('click', () => {
        templateModal.classList.add('hidden');
    });
    
    // Initialize with first semester
    addNewSemester("Semester 1", userPreferredSubjects);
    
    // Enhanced event listeners with debouncing
    let inputTimeout;
    const debounceDelay = 300;
    
    addSemesterBtn.addEventListener('click', handleAddSemester);
    semestersContainer.addEventListener('click', handleDynamicClickEvents);
    semestersContainer.addEventListener('input', debounce(handleInputChange, debounceDelay));
    saveDataBtn.addEventListener('click', handleSaveData);
    loadDataBtn.addEventListener('click', handleLoadData);
    resetDataBtn.addEventListener('click', handleResetData);
    
    // Initialize chart
    initChart();
    
    // Utility Functions
    function debounce(func, wait) {
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(inputTimeout);
                func(...args);
            };
            clearTimeout(inputTimeout);
            inputTimeout = setTimeout(later, wait);
        };
    }
    
    function animateValue(element, start, end, duration = 1000) {
        const startTime = performance.now();
        const startValue = parseFloat(start) || 0;
        const endValue = parseFloat(end) || 0;
        
        element.classList.add('changing');
        
        function updateValue(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            const easeOutCubic = 1 - Math.pow(1 - progress, 3);
            const currentValue = startValue + (endValue - startValue) * easeOutCubic;
            
            element.textContent = currentValue.toFixed(2);
            
            if (progress < 1) {
                requestAnimationFrame(updateValue);
            } else {
                element.classList.remove('changing');
            }
        }
        
        requestAnimationFrame(updateValue);
    }
    
    function showAchievementNotification(achievement) {
        achievementTitle.textContent = achievement.name;
        achievementText.textContent = achievement.description;
        
        achievementNotification.classList.add('show');
        
        // Add confetti effect
        createConfetti();
        
        setTimeout(() => {
            achievementNotification.classList.remove('show');
        }, 4000);
    }
    
    function createConfetti() {
        const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#f0932b', '#eb4d4b', '#6c5ce7'];
        const confettiCount = 50;
        
        for (let i = 0; i < confettiCount; i++) {
            createConfettiPiece(colors[Math.floor(Math.random() * colors.length)]);
        }
    }
    
    function createConfettiPiece(color) {
        const confetti = document.createElement('div');
        confetti.style.cssText = `
            position: fixed;
            width: 10px;
            height: 10px;
            background: ${color};
            top: -10px;
            left: ${Math.random() * 100}vw;
            z-index: 1000;
            pointer-events: none;
            transform: rotate(${Math.random() * 360}deg);
        `;
        
        document.body.appendChild(confetti);
        
        const animation = confetti.animate([
            { transform: `translateY(0) rotate(0deg)`, opacity: 1 },
            { transform: `translateY(100vh) rotate(720deg)`, opacity: 0 }
        ], {
            duration: Math.random() * 2000 + 1000,
            easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
            fill: 'forwards'
        });
        
        animation.onfinish = () => confetti.remove();
    }
    
    function checkAchievements() {
        achievementsList.forEach(achievement => {
            if (!achievements.includes(achievement.id) && achievement.condition()) {
                achievements.push(achievement.id);
                showAchievementNotification(achievement);
            }
        });
    }
    
    function updatePerformanceStatus(cgpa) {
        let status, icon, text, description, className;
        
        if (cgpa >= 9.0) {
            status = 'excellent';
            icon = 'fas fa-trophy';
            text = 'Excellent Performance!';
            description = 'Outstanding academic achievement! Keep up the great work!';
        } else if (cgpa >= 8.0) {
            status = 'good';
            icon = 'fas fa-star';
            text = 'Good Performance!';
            description = 'You\'re doing well! A little more effort can make it excellent!';
        } else if (cgpa >= 6.0) {
            status = 'average';
            icon = 'fas fa-chart-line';
            text = 'Average Performance';
            description = 'There\'s room for improvement. Focus on your weak subjects!';
        } else {
            status = 'poor';
            icon = 'fas fa-exclamation-triangle';
            text = 'Needs Improvement';
            description = 'Consider seeking help and dedicating more time to studies.';
        }
        
        performanceStatus.className = `mb-6 p-4 rounded-lg transition-all duration-500 ${status}`;
        statusIcon.className = `${icon} mr-2 animate-spin-slow`;
        statusText.textContent = text;
        statusDescription.textContent = description;
    }
    
    // Event Handlers
    function handleAddSemester() {
        const semesterName = prompt("Enter the name for the new semester:", `Semester ${semesterCounter + 1}`);
        if (!semesterName) return;
        
        const subjectCount = parseInt(prompt(
            `How many subjects for ${semesterName}?`, 
            lastSubjectCount
        )) || 1;
        
        // Save for next time
        lastSubjectCount = subjectCount;
        localStorage.setItem('lastSubjectCount', lastSubjectCount);
        
        addNewSemester(semesterName, subjectCount);
        
        // Show template option for new semesters
        setTimeout(() => {
            if (confirm("Would you like to load a subject template?")) {
                templateModal.classList.remove('hidden');
            }
        }, 300);
    }
    
    function handleDynamicClickEvents(e) {
        if (e.target.classList.contains('delete-semester') || e.target.closest('.delete-semester')) {
            const semesterCard = e.target.closest('.semester-card');
            if (semesterCard && document.querySelectorAll('.semester-card').length > 1) {
                // Add exit animation
                semesterCard.style.transform = 'translateX(-100px)';
                semesterCard.style.opacity = '0';
                
                setTimeout(() => {
                    semesterCard.remove();
                    calculateAllGrades();
                }, 300);
            } else if (document.querySelectorAll('.semester-card').length === 1) {
                // Shake animation for error
                semesterCard.classList.add('animate-shake');
                setTimeout(() => semesterCard.classList.remove('animate-shake'), 500);
                
                showNotification("You need at least one semester!", 'error');
            }
        }
        
        if (e.target.classList.contains('delete-subject') || e.target.closest('.delete-subject')) {
            const row = e.target.closest('tr');
            if (row && row.parentElement.querySelectorAll('tr').length > 1) {
                row.style.transform = 'translateX(-20px)';
                row.style.opacity = '0';
                
                setTimeout(() => {
                    row.remove();
                    calculateAllGrades();
                }, 300);
            } else {
                // Shake animation for error
                row.classList.add('animate-shake');
                setTimeout(() => row.classList.remove('animate-shake'), 500);
            }
        }
        
        if (e.target.classList.contains('add-subject') || e.target.closest('.add-subject')) {
            const tbody = e.target.closest('tfoot').previousElementSibling;
            addNewSubjectRow(tbody);
        }
        
        if (e.target.classList.contains('copy-semester') || e.target.closest('.copy-semester')) {
            const semesterCard = e.target.closest('.semester-card');
            copyPreviousSemester(semesterCard);
        }
    }
    
    function handleInputChange(e) {
        if (e.target.classList.contains('credit-input') || 
            e.target.classList.contains('grade-select') || 
            e.target.classList.contains('subject-input')) {
            
            // Add glow effect to changed input
            e.target.classList.add('animate-glow');
            setTimeout(() => e.target.classList.remove('animate-glow'), 2000);
            
            calculateAllGrades();
        }
    }
    
    function handleSaveData() {
        saveDataBtn.classList.add('loading');
        
        setTimeout(() => {
            saveToLocalStorage();
            saveDataBtn.classList.remove('loading');
            showNotification('Data saved successfully!', 'success');
        }, 500);
    }
    
    function handleLoadData() {
        loadDataBtn.classList.add('loading');
        
        setTimeout(() => {
            loadFromLocalStorage();
            loadDataBtn.classList.remove('loading');
        }, 500);
    }
    
    function handleResetData() {
        if (confirm('Are you sure you want to reset all data? This cannot be undone.')) {
            resetDataBtn.classList.add('loading');
            
            setTimeout(() => {
                resetAllData();
                resetDataBtn.classList.remove('loading');
                showNotification('Data reset successfully!', 'success');
            }, 500);
        }
    }
    
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `fixed top-4 left-4 px-6 py-4 rounded-lg shadow-lg z-50 transform -translate-x-full transition-all duration-500`;
        
        const colors = {
            success: 'bg-green-500 text-white',
            error: 'bg-red-500 text-white',
            info: 'bg-blue-500 text-white'
        };
        
        notification.className += ` ${colors[type]}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        setTimeout(() => {
            notification.style.transform = 'translateX(-100%)';
            setTimeout(() => notification.remove(), 500);
        }, 3000);
    }
    
    // Core Functions
    function addNewSemester(semesterName, subjectCount = userPreferredSubjects) {
        const semesterId = `semester-${semesterCounter}`;
        
        const semesterHTML = `
            <div class="semester-card border border-gray-200 rounded-lg p-4 fade-in" data-semester-id="${semesterId}">
                <div class="flex justify-between items-center mb-4">
                    <div>
                        <h3 class="text-xl font-medium">${semesterName}</h3>
                        <div class="text-sm text-gray-500 summary-display">Subjects: 0, Credits: 0</div>
                    </div>
                    <div class="flex space-x-2">
                        <button class="text-blue-500 hover:text-blue-700 copy-semester p-2 rounded-full hover:bg-blue-50"
                                title="Copy previous semester">
                            <i class="fas fa-copy"></i>
                        </button>
                        <button class="text-red-500 hover:text-red-700 delete-semester transition-all duration-300 p-2 rounded-full hover:bg-red-50">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </div>
                </div>
                
                <div class="overflow-x-auto">
                    <table class="grade-table w-full border-collapse">
                        <thead>
                            <tr class="bg-gray-100">
                                <th class="py-2 px-4 text-left">Subject</th>
                                <th class="py-2 px-4 text-left">Credits</th>
                                <th class="py-2 px-4 text-left">Grade</th>
                                <th class="py-2 px-4"></th>
                            </tr>
                        </thead>
                        <tbody>
                        </tbody>
                        <tfoot>
                            <tr>
                                <td colspan="4" class="pt-2">
                                    <button class="add-subject text-indigo-600 hover:text-indigo-800 p-2 flex items-center text-sm transition-all duration-300">
                                        <i class="fas fa-plus mr-1"></i> Add Subject
                                    </button>
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
        `;
        semestersContainer.insertAdjacentHTML('beforeend', semesterHTML);
        
        // Get the newly created semester card
        const semesterCard = semestersContainer.lastElementChild;
        const tbody = semesterCard.querySelector('tbody');
        
        // Add subject rows
        for (let i = 0; i < subjectCount; i++) {
            addNewSubjectRow(tbody);
        }
        
        semesterCounter++;
        calculateAllGrades();
        
        // Add entrance animation
        semesterCard.style.transform = 'translateY(20px)';
        semesterCard.style.opacity = '0';
        
        requestAnimationFrame(() => {
            semesterCard.style.transition = 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
            semesterCard.style.transform = 'translateY(0)';
            semesterCard.style.opacity = '1';
        });
    }
    
    function addNewSubjectRow(tbody) {
        const newRowHTML = `
            <tr class="animate-bounce-in">
                <td class="py-2 px-4">
                    <input type="text" class="w-full p-2 border rounded subject-input" placeholder="E.g. Physics">
                </td>
                <td class="py-2 px-4">
                    <input type="number" class="w-full p-2 border rounded credit-input" placeholder="4" min="1" max="10" value="4">
                </td>
                <td class="py-2 px-4">
                    <select class="w-full p-2 border rounded grade-select">
                        <option value="10">O (10)</option>
                        <option value="9" selected>A+ (9)</option>
                        <option value="8">A (8)</option>
                        <option value="7">B+ (7)</option>
                        <option value="6">B (6)</option>
                        <option value="0">F (0)</option>
                    </select>
                </td>
                <td class="py-2 px-4 text-center">
                    <button class="text-red-500 hover:text-red-700 delete-subject transition-all duration-300 p-1 rounded">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </td>
            </tr>
        `;
        tbody.insertAdjacentHTML('beforeend', newRowHTML);
        
        // Focus on the new subject input
        const newRow = tbody.lastElementChild;
        const subjectInput = newRow.querySelector('.subject-input');
        setTimeout(() => subjectInput.focus(), 100);
        
        // Setup navigation for the new row
        setupSubjectNavigation(newRow);
    }
    
    function calculateAllGrades() {
        const semesters = document.querySelectorAll('.semester-card');
        semesterData = [];
        
        semesters.forEach((semester, index) => {
            const semesterName = semester.querySelector('h3').textContent;
            const rows = semester.querySelectorAll('tbody tr');
            const semesterSubjects = [];
            
            // Update semester summary
            updateSemesterSummary(semester);
            
            rows.forEach(row => {
                const subject = row.querySelector('.subject-input').value;
                const credits = parseInt(row.querySelector('.credit-input').value) || 0;
                const grade = parseInt(row.querySelector('.grade-select').value) || 0;
                
                // Skip subjects with no name or zero credits
                if (subject.trim() && credits > 0) {
                    semesterSubjects.push({ subject, credits, grade });
                }
            });
            
            semesterData.push({
                id: semester.dataset.semesterId || `semester-${index+1}`,
                name: semesterName,
                subjects: semesterSubjects
            });
        });
        
        // Calculate SGPA (latest semester)
        let sgpa = 0;
        let sgpaCredits = 0;
        let sgpaPoints = 0;
        
        if (semesterData.length > 0) {
            const currentSemester = semesterData[semesterData.length - 1];
            
            if (currentSemester.subjects.length > 0) {
                currentSemester.subjects.forEach(subj => {
                    sgpaCredits += subj.credits;
                    sgpaPoints += subj.credits * subj.grade;
                });
                
                if (sgpaCredits > 0) {
                    sgpa = sgpaPoints / sgpaCredits;
                }
            }
        }
        
        // Calculate CGPA (all semesters)
        let cgpa = 0;
        let totalCredits = 0;
        let totalPoints = 0;
        
        semesterData.forEach(sem => {
            sem.subjects.forEach(subj => {
                totalCredits += subj.credits;
                totalPoints += subj.credits * subj.grade;
            });
        });
        
        if (totalCredits > 0) {
            cgpa = totalPoints / totalCredits;
        }
        
        // Animate value changes
        const currentSGPA = parseFloat(sgpaDisplay.textContent) || 0;
        const currentCGPA = parseFloat(cgpaDisplay.textContent) || 0;
        
        if (Math.abs(sgpa - currentSGPA) > 0.01) {
            animateValue(sgpaDisplay, currentSGPA, sgpa);
            animateValue(sgpaText, currentSGPA, sgpa);
        }
        
        if (Math.abs(cgpa - currentCGPA) > 0.01) {
            animateValue(cgpaDisplay, currentCGPA, cgpa);
            animateValue(cgpaText, currentCGPA, cgpa);
        }
        
        // Update progress circles with animation
        updateCircleProgress(sgpaCircle, sgpa, 'indigo');
        updateCircleProgress(cgpaCircle, cgpa, 'green');
        
        // Update performance status
        updatePerformanceStatus(cgpa);
        
        // Check for achievements
        lastCGPA = currentCGPA;
        checkAchievements();
        
        // Update chart
        updateChart();
    }
    
    function updateCircleProgress(circle, value, color) {
        const percentage = Math.min(value / 10, 1);
        const offset = MAX_OFFSET - (MAX_OFFSET * percentage);
        
        circle.style.strokeDashoffset = Math.max(0, offset);
        circle.style.stroke = {
            'indigo': '#4f46e5',
            'green': '#059669'
        }[color];
        
        // Add pulse effect for significant changes
        if (value >= 9) {
            circle.style.filter = 'drop-shadow(0 0 8px currentColor)';
        } else {
            circle.style.filter = 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))';
        }
    }
    
    function initChart() {
        const ctx = document.getElementById('performanceChart').getContext('2d');
        chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'SGPA',
                    data: [],
                    borderColor: '#4f46e5',
                    backgroundColor: 'rgba(79, 70, 229, 0.1)',
                    borderWidth: 3,
                    tension: 0.4,
                    fill: true,
                    pointBackgroundColor: '#4f46e5',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    pointRadius: 6,
                    pointHoverRadius: 8,
                }, {
                    label: 'CGPA',
                    data: [],
                    borderColor: '#059669',
                    backgroundColor: 'rgba(5, 150, 105, 0.1)',
                    borderWidth: 3,
                    tension: 0.4,
                    fill: true,
                    pointBackgroundColor: '#059669',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    pointRadius: 6,
                    pointHoverRadius: 8,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    intersect: false,
                    mode: 'index'
                },
                plugins: {
                    legend: {
                        labels: {
                            usePointStyle: true,
                            padding: 20
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: '#ffffff',
                        bodyColor: '#ffffff',
                        borderColor: '#4f46e5',
                        borderWidth: 1,
                        cornerRadius: 8,
                        displayColors: true
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 10,
                        ticks: {
                            stepSize: 1,
                            color: '#6b7280'
                        },
                        grid: {
                            color: '#e5e7eb'
                        }
                    },
                    x: {
                        ticks: {
                            color: '#6b7280'
                        },
                        grid: {
                            color: '#e5e7eb'
                        }
                    }
                },
                elements: {
                    line: {
                        capBezierPoints: true
                    }
                },
                animation: {
                    duration: 1000,
                    easing: 'easeInOutCubic'
                }
            }
        });
    }
    
    function updateChart() {
        if (!chart) return;
        
        const labels = semesterData.map(sem => sem.name);
        const sgpaData = semesterData.map(sem => {
            let credits = 0;
            let points = 0;
            
            sem.subjects.forEach(subj => {
                credits += subj.credits;
                points += subj.credits * subj.grade;
            });
            
            return credits > 0 ? parseFloat((points / credits).toFixed(2)) : 0;
        });
        
        // Calculate cumulative CGPA for each semester
        const cgpaData = [];
        let totalCredits = 0;
        let totalPoints = 0;
        
        semesterData.forEach((sem, index) => {
            sem.subjects.forEach(subj => {
                totalCredits += subj.credits;
                totalPoints += subj.credits * subj.grade;
            });
            
            cgpaData.push(totalCredits > 0 ? parseFloat((totalPoints / totalCredits).toFixed(2)) : 0);
        });
        
        chart.data.labels = labels;
        chart.data.datasets[0].data = sgpaData;
        chart.data.datasets[1].data = cgpaData;
        chart.update('active');
    }
    
    // Helper functions for achievements
    function getTotalSubjects() {
        return semesterData.reduce((total, sem) => total + sem.subjects.length, 0);
    }
    
    function getCurrentSGPA() {
        if (semesterData.length === 0) return 0;
        
        const currentSemester = semesterData[semesterData.length - 1];
        let credits = 0;
        let points = 0;
        
        currentSemester.subjects.forEach(subj => {
            credits += subj.credits;
            points += subj.credits * subj.grade;
        });
        
        return credits > 0 ? points / credits : 0;
    }
    
    function getCurrentCGPA() {
        let totalCredits = 0;
        let totalPoints = 0;
        
        semesterData.forEach(sem => {
            sem.subjects.forEach(subj => {
                totalCredits += subj.credits;
                totalPoints += subj.credits * subj.grade;
            });
        });
        
        return totalCredits > 0 ? totalPoints / totalCredits : 0;
    }
    
    // New functions for improvements
    function loadTemplate(templateName) {
        const template = templates[templateName];
        if (!template) return;
        
        const currentSemester = document.querySelector('.semester-card:last-child');
        if (!currentSemester) return;
        
        const tbody = currentSemester.querySelector('tbody');
        tbody.innerHTML = '';
        
        template.forEach(subject => {
            const row = document.createElement('tr');
            row.className = 'animate-bounce-in';
            row.innerHTML = `
                <td class="py-2 px-4">
                    <input type="text" class="w-full p-2 border rounded subject-input" 
                           value="${subject.name}">
                </td>
                <td class="py-2 px-4">
                    <input type="number" class="w-full p-2 border rounded credit-input" 
                           value="${subject.credits}" min="1" max="10">
                </td>
                <td class="py-2 px-4">
                    <select class="w-full p-2 border rounded grade-select">
                        <option value="10">O (10)</option>
                        <option value="9" selected>A+ (9)</option>
                        <option value="8">A (8)</option>
                        <option value="7">B+ (7)</option>
                        <option value="6">B (6)</option>
                        <option value="0">F (0)</option>
                    </select>
                </td>
                <td class="py-2 px-4 text-center">
                    <button class="text-red-500 hover:text-red-700 delete-subject transition-all duration-300 p-1 rounded">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(row);
            
            // Setup navigation for the new row
            setupSubjectNavigation(row);
        });
        
        calculateAllGrades();
        showNotification(`${templateName.charAt(0).toUpperCase() + templateName.slice(1)} template loaded!`, 'success');
    }
    
    function copyPreviousSemester(semesterCard) {
        const prevSemester = document.querySelector('.semester-card:nth-last-child(2)');
        if (!prevSemester) {
            showNotification("No previous semester to copy!", 'error');
            return;
        }
        
        const prevRows = prevSemester.querySelectorAll('tbody tr');
        const tbody = semesterCard.querySelector('tbody');
        tbody.innerHTML = '';
        
        prevRows.forEach(row => {
            const subject = row.querySelector('.subject-input').value;
            const credits = row.querySelector('.credit-input').value;
            
            const newRow = document.createElement('tr');
            newRow.className = 'animate-bounce-in';
            newRow.innerHTML = `
                <td class="py-2 px-4">
                    <input type="text" class="w-full p-2 border rounded subject-input" 
                           value="${subject}">
                </td>
                <td class="py-2 px-4">
                    <input type="number" class="w-full p-2 border rounded credit-input" 
                           value="${credits}" min="1" max="10">
                </td>
                <td class="py-2 px-4">
                    <select class="w-full p-2 border rounded grade-select">
                        <option value="10">O (10)</option>
                        <option value="9" selected>A+ (9)</option>
                        <option value="8">A (8)</option>
                        <option value="7">B+ (7)</option>
                        <option value="6">B (6)</option>
                        <option value="0">F (0)</option>
                    </select>
                </td>
                <td class="py-2 px-4 text-center">
                    <button class="text-red-500 hover:text-red-700 delete-subject transition-all duration-300 p-1 rounded">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(newRow);
            
            // Setup navigation for the new row
            setupSubjectNavigation(newRow);
        });
        
        calculateAllGrades();
        showNotification("Previous semester structure copied!", 'success');
    }
    
    function updateSemesterSummary(semesterCard) {
        const rows = semesterCard.querySelectorAll('tbody tr');
        let totalCredits = 0;
        let validSubjects = 0;
        
        rows.forEach(row => {
            const credits = parseInt(row.querySelector('.credit-input').value) || 0;
            const subject = row.querySelector('.subject-input').value.trim();
            
            if (subject && credits > 0) {
                validSubjects++;
                totalCredits += credits;
            }
        });
        
        const summary = semesterCard.querySelector('.summary-display');
        if (summary) {
            summary.textContent = `Subjects: ${validSubjects}, Credits: ${totalCredits}`;
        }
        
        // Highlight if no valid subjects
        if (validSubjects === 0) {
            semesterCard.classList.add('border-red-500');
            semesterCard.querySelector('h3').classList.add('text-red-500');
        } else {
            semesterCard.classList.remove('border-red-500');
            semesterCard.querySelector('h3').classList.remove('text-red-500');
        }
    }
    
    function setupSubjectNavigation(row) {
        const inputs = Array.from(row.querySelectorAll('input, select'));
        
        inputs.forEach(input => {
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    const currentIndex = inputs.indexOf(e.target);
                    
                    if (currentIndex < inputs.length - 1) {
                        // Focus next input in same row
                        inputs[currentIndex + 1].focus();
                    } else {
                        // Focus next row's first input
                        const nextRow = row.nextElementSibling;
                        if (nextRow) {
                            nextRow.querySelector('input').focus();
                        } else {
                            // Add new row if at last row
                            const addBtn = row.closest('table').querySelector('.add-subject');
                            if (addBtn) {
                                addBtn.click();
                                setTimeout(() => {
                                    const newRow = row.nextElementSibling;
                                    if (newRow) newRow.querySelector('input').focus();
                                }, 100);
                            }
                        }
                    }
                }
            });
        });
    }
    
    // Local Storage Functions
    function saveToLocalStorage() {
        const dataToSave = {
            semesters: semesterData,
            counter: semesterCounter,
            achievements: achievements,
            lastSubjectCount: lastSubjectCount
        };
        
        localStorage.setItem('academicPerformanceData', JSON.stringify(dataToSave));
    }
    
    function loadFromLocalStorage() {
        const savedData = localStorage.getItem('academicPerformanceData');
        
        if (savedData) {
            const data = JSON.parse(savedData);
            semesterCounter = data.counter || 1;
            achievements = data.achievements || [];
            lastSubjectCount = data.lastSubjectCount || 5;
            
            // Clear existing semesters
            semestersContainer.innerHTML = '';
            
            // Recreate semesters from saved data
            data.semesters.forEach(semester => {
                const semesterHTML = `
                    <div class="semester-card border border-gray-200 rounded-lg p-4 fade-in" data-semester-id="${semester.id}">
                        <div class="flex justify-between items-center mb-4">
                            <div>
                                <h3 class="text-xl font-medium">${semester.name}</h3>
                                <div class="text-sm text-gray-500 summary-display">Subjects: ${semester.subjects.length}, Credits: ${semester.subjects.reduce((sum, subj) => sum + subj.credits, 0)}</div>
                            </div>
                            <div class="flex space-x-2">
                                <button class="text-blue-500 hover:text-blue-700 copy-semester p-2 rounded-full hover:bg-blue-50"
                                        title="Copy previous semester">
                                    <i class="fas fa-copy"></i>
                                </button>
                                <button class="text-red-500 hover:text-red-700 delete-semester transition-all duration-300 p-2 rounded-full hover:bg-red-50">
                                    <i class="fas fa-trash-alt"></i>
                                </button>
                            </div>
                        </div>
                        
                        <div class="overflow-x-auto">
                            <table class="grade-table w-full border-collapse">
                                <thead>
                                    <tr class="bg-gray-100">
                                        <th class="py-2 px-4 text-left">Subject</th>
                                        <th class="py-2 px-4 text-left">Credits</th>
                                        <th class="py-2 px-4 text-left">Grade</th>
                                        <th class="py-2 px-4"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${semester.subjects.map(subject => `
                                        <tr>
                                            <td class="py-2 px-4">
                                                <input type="text" class="w-full p-2 border rounded subject-input" placeholder="E.g. Mathematics" value="${subject.subject}">
                                            </td>
                                            <td class="py-2 px-4">
                                                <input type="number" class="w-full p-2 border rounded credit-input" placeholder="4" min="1" max="10" value="${subject.credits}">
                                            </td>
                                            <td class="py-2 px-4">
                                                <select class="w-full p-2 border rounded grade-select">
                                                    <option value="10" ${subject.grade === 10 ? 'selected' : ''}>O (10)</option>
                                                    <option value="9" ${subject.grade === 9 ? 'selected' : ''}>A+ (9)</option>
                                                    <option value="8" ${subject.grade === 8 ? 'selected' : ''}>A (8)</option>
                                                    <option value="7" ${subject.grade === 7 ? 'selected' : ''}>B+ (7)</option>
                                                    <option value="6" ${subject.grade === 6 ? 'selected' : ''}>B (6)</option>
                                                    <option value="0" ${subject.grade === 0 ? 'selected' : ''}>F (0)</option>
                                                </select>
                                            </td>
                                            <td class="py-2 px-4 text-center">
                                                <button class="text-red-500 hover:text-red-700 delete-subject transition-all duration-300 p-1 rounded">
                                                    <i class="fas fa-trash-alt"></i>
                                                </button>
                                            </td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                                <tfoot>
                                    <tr>
                                        <td colspan="4" class="pt-2">
                                            <button class="add-subject text-indigo-600 hover:text-indigo-800 p-2 flex items-center text-sm transition-all duration-300">
                                                <i class="fas fa-plus mr-1"></i> Add Subject
                                            </button>
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>
                `;
                semestersContainer.insertAdjacentHTML('beforeend', semesterHTML);
                
                // Setup navigation for each row
                const newCard = semestersContainer.lastElementChild;
                const rows = newCard.querySelectorAll('tbody tr');
                rows.forEach(row => setupSubjectNavigation(row));
            });
            
            calculateAllGrades();
            showNotification('Data loaded successfully!', 'success');
        } else {
            showNotification('No saved data found!', 'error');
        }
    }
    
    function resetAllData() {
        localStorage.removeItem('academicPerformanceData');
        semestersContainer.innerHTML = '';
        semesterCounter = 1;
        achievements = [];
        lastSubjectCount = 5;
        addNewSemester("Semester 1", userPreferredSubjects);
        calculateAllGrades();
    }
    
    // Initialize performance status
    updatePerformanceStatus(0);
});

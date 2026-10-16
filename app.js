window.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        document.getElementById('splash-screen').classList.add('hidden');
        document.getElementById('app-container').classList.remove('hidden');
    }, 2000);
});

function openSection(sectionId) {
    document.querySelectorAll('.main-content > section, .main-content > div').forEach(el => {
        if (!el.classList.contains('welcome-banner') && !el.classList.contains('grid-menu')) {
            el.classList.add('hidden');
        }
    });
    document.querySelector('.welcome-banner').classList.add('hidden');
    document.querySelector('.grid-menu').classList.add('hidden');

    const target = document.getElementById(sectionId + '-section');
    if (target) target.classList.remove('hidden');
    
    if (sectionId === 'saved') loadSavedLessons();
}

function closeSection() {
    document.querySelectorAll('.section-panel').forEach(el => el.classList.add('hidden'));
    document.querySelector('.welcome-banner').classList.remove('hidden');
    document.querySelector('.grid-menu').classList.remove('hidden');
}

let currentLessonData = null;

async function generateLesson(event) {
    event.preventDefault();
    
    const level = document.getElementById('level').value;
    const domain = document.getElementById('domain').value;
    const strand = document.getElementById('strand').value;
    const title = document.getElementById('title').value;
    const duration = document.getElementById('duration').value;
    const pedagogyType = document.getElementById('pedagogyType').value;
    const studentLevel = document.getElementById('studentLevel').value;

    document.getElementById('lesson-form').classList.add('hidden');
    document.getElementById('loading-indicator').classList.remove('hidden');

    try {
        // ضع رابط سيرفرك على Render هنا مكان هذا الرابط:
        const response = await fetch('https://math-iq-backend.onrender.com/api/generate-lesson', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ level, domain, strand, title, duration, pedagogyType, studentLevel })
        });

        const result = await response.json();
        
        if (result.success) {
            currentLessonData = result.data;
            displayLesson(currentLessonData);
            document.getElementById('generator-section').classList.add('hidden');
            document.getElementById('result-section').classList.remove('hidden');
        } else {
            alert('حدث خطأ أثناء التوليد: ' + result.message);
        }
    } catch (error) {
        console.error(error);
        alert('تعذر الاتصال بالخادم. يرجى التحقق من اتصال الإنترنت.');
    } finally {
        document.getElementById('lesson-form').classList.remove('hidden');
        document.getElementById('loading-indicator').classList.add('hidden');
    }
}

function displayLesson(data) {
    const output = document.getElementById('lesson-output');
    output.innerHTML = `
        <h4>📌 المعلومات العامة</h4>
        <p><b>المستوى:</b> ${data.generalInfo.level} | <b>الميدان:</b> ${data.generalInfo.domain}</p>
        <p><b>المقطع:</b> ${data.generalInfo.strand} | <b>الدرس:</b> ${data.generalInfo.title}</p>
        <hr style="margin: 10px 0;">
        <h4>🎯 الأهداف والكفاءات</h4>
        <p><b>الكفاءة المستهدفة:</b> ${data.generalInfo.targetedCompetency}</p>
        <p><b>الأهداف:</b> ${data.generalInfo.objectives ? data.generalInfo.objectives.join(', ') : ''}</p>
        <hr style="margin: 10px 0;">
        <h4>💡 وضعية الانطلاق</h4>
        <p>${data.launchPosition.problem}</p>
        <hr style="margin: 10px 0;">
        <h4>📐 القاعدة الرياضية الأساسية</h4>
        <p>${data.rule.statement}</p>
        <p><em>شرح:</em> ${data.rule.explanation}</p>
    `;
}

function saveLessonLocally() {
    if (!currentLessonData) return;
    let saved = JSON.parse(localStorage.getItem('math_iq_lessons') || '[]');
    saved.push({ title: currentLessonData.generalInfo.title, date: new Date().toLocaleDateString('ar-DZ'), data: currentLessonData });
    localStorage.setItem('math_iq_lessons', JSON.stringify(saved));
    alert('تم حفظ المذكرة بنجاح على الهاتف!');
}

function loadSavedLessons() {
    const container = document.getElementById('saved-list');
    let saved = JSON.parse(localStorage.getItem('math_iq_lessons') || '[]');
    if (saved.length === 0) {
        container.innerHTML = '<p>لا توجد مذكرات محفوظة حتى الآن.</p>';
        return;
    }
    container.innerHTML = saved.map((item, index) => `
        <div style="background:#f1f3f4; padding:10px; border-radius:8px; margin-bottom:8px;">
            <strong>${item.title}</strong> <small>(${item.date})</small>
        </div>
    `).join('');
}

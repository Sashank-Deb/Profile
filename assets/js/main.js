/*==================== MENU SHOW Y HIDDEN ====================*/
const navMenu = document.getElementById('nav-menu'),
navToggle = document.getElementById('nav-toggle'),
navClose = document.getElementById('nav-close')

/*===== MENU SHOW =====*/
/* Validate if constant exists */
if(navToggle){
    navToggle.addEventListener('click', ()=>{
        navMenu.classList.add('show-menu')
    })
}

/*===== MENU HIDDEN =====*/
/* Validate if constant exists */
if(navClose){
    navClose.addEventListener('click', ()=>{
        navMenu.classList.remove('show-menu')
    })
}

/*==================== REMOVE MENU MOBILE ====================*/
const navLink = document.querySelectorAll('.nav__link')

function linkAction(){
    const navMenu = document.getElementById('nav-menu')
    // When we click on each nav__link, we remove the show-menu class
    navMenu.classList.remove('show-menu')
}
navLink.forEach(n => n.addEventListener('click', linkAction))

/*==================== ACCORDION SKILLS ====================*/
const skillsContent = document.getElementsByClassName('skills__content'),
    skillsHeader = document.querySelectorAll('.skills__header')

function toggleSkills(){
    let itemClass = this.parentNode.className

    for(i =0; i<skillsContent.length; i++){
        skillsContent[i].className = 'skills__content skills__close'
    }
    if(itemClass === 'skills__content skills__close'){
        this.parentNode.className = 'skills__content skills__open'
    }
}

skillsHeader.forEach((el)=>{
    el.addEventListener('click', toggleSkills)
})

/*==================== QUALIFICATION TABS ====================*/
const tabs = document.querySelectorAll('[data-target]'),
    tabContents = document.querySelectorAll('[data-content]')

tabs.forEach(tab => {
    tab.addEventListener('click', () =>{
        const target = document.querySelector(tab.dataset.target)

        tabContents.forEach(tabContent => {
            tabContent.classList.remove('qualification__active')
        })
        target.classList.add('qualification__active')

        tabs.forEach(tab =>{
            tab.classList.remove('qualification__active')
        })
        tab.classList.add('qualification__active')
    })
})

/*==================== PORTFOLIO SWIPER  ====================*/
let swiperPortfolio = new Swiper('.portfolio__container', {
    cssMode: true,
    loop: true,

    navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
    },
    pagination: {
        el: '.swiper-pagination',
        clickable: true,
    },
});

/*==================== VIDEOS SWIPER  ====================*/
let swiperVideos = new Swiper('.videos__container', {
    loop: true,
    grabCursor: true,
    spaceBetween: 48,

    pagination: {
        el: '.swiper-pagination',
        clickable: true,
        dynamicBullets: true,
    },
    breakpoints:{
        568:{
            slidesPerview: 2,
        }
    }
});

/*==================== SCROLL SECTIONS ACTIVE LINK ====================*/
const sections = document.querySelectorAll('section[id]')

function scrollActive(){
    const scrollY = window.pageYOffset

    sections.forEach(current =>{
        const sectionHeight = current.offsetHeight
        const sectionTop = current.offsetTop - 50;
        sectionId = current.getAttribute('id')

        if(scrollY > sectionTop && scrollY <= sectionTop + sectionHeight){
            document.querySelector('.nav__menu a[href*=' + sectionId + ']').classList.add('active-link')
        }else{
            document.querySelector('.nav__menu a[href*=' + sectionId + ']').classList.remove('active-link')
        }
    })
}
window.addEventListener('scroll', scrollActive)

/*==================== CHANGE BACKGROUND HEADER ====================*/ 
function scrollHeader(){
    const nav = document.getElementById('header')
    // When the scroll is greater than 200 viewport height, add the scroll-header class to the header tag
    if(this.scrollY >= 80) nav.classList.add('scroll-header'); else nav.classList.remove('scroll-header')
}
window.addEventListener('scroll', scrollHeader)

/*==================== SHOW SCROLL UP ====================*/ 
function scrollUp(){
    const scrollUp = document.getElementById('scroll-up');
    // When the scroll is higher than 560 viewport height, add the show-scroll class to the a tag with the scroll-top class
    if(this.scrollY >= 560) scrollUp.classList.add('show-scroll'); else scrollUp.classList.remove('show-scroll')
}
window.addEventListener('scroll', scrollUp)

/*==================== DARK LIGHT THEME ====================*/ 
const themeButton = document.getElementById('theme-button')
const darkTheme = 'dark-theme'
const iconTheme = 'uil-sun'

// Previously selected topic (if user selected)
const selectedTheme = localStorage.getItem('selected-theme')
const selectedIcon = localStorage.getItem('selected-icon')

// We obtain the current theme that the interface has by validating the dark-theme class
const getCurrentTheme = () => document.body.classList.contains(darkTheme) ? 'dark' : 'light'
const getCurrentIcon = () => themeButton.classList.contains(iconTheme) ? 'uil-moon' : 'uil-sun'

// We validate if the user previously chose a topic
if (selectedTheme) {
  // If the validation is fulfilled, we ask what the issue was to know if we activated or deactivated the dark
  document.body.classList[selectedTheme === 'dark' ? 'add' : 'remove'](darkTheme)
  themeButton.classList[selectedIcon === 'uil-moon' ? 'add' : 'remove'](iconTheme)
}

// Activate / deactivate the theme manually with the button
themeButton.addEventListener('click', () => {
    // Add or remove the dark / icon theme
    document.body.classList.toggle(darkTheme)
    themeButton.classList.toggle(iconTheme)
    // We save the theme and the current icon that the user chose
    localStorage.setItem('selected-theme', getCurrentTheme())
    localStorage.setItem('selected-icon', getCurrentIcon())
})

/*==================== CONTACT FORM SUBMISSION (FIREBASE) ====================*/
const FIREBASE_DB_URL = 'https://porfolio-contact-form-ddf3a-default-rtdb.asia-southeast1.firebasedatabase.app/submissions.json';

const contactForm = document.getElementById('contact-form');
const contactButton = document.getElementById('contact-button');
const contactStatus = document.getElementById('contact-status');

if (contactForm) {
    contactForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        const nameInput = document.getElementById('contact-name');
        const emailInput = document.getElementById('contact-email');
        const messageInput = document.getElementById('contact-message-input');

        const name = nameInput ? nameInput.value.trim() : '';
        const email = emailInput ? emailInput.value.trim() : '';
        const message = messageInput ? messageInput.value.trim() : '';

        if (!name || !email || !message) {
            contactStatus.className = 'contact__message error';
            contactStatus.textContent = 'Please fill in all required fields.';
            return;
        }

        // Show loading / sending feedback
        const originalButtonHtml = contactButton.innerHTML;
        contactButton.disabled = true;
        contactButton.innerHTML = 'Sending... <i class="uil uil-spinner button__icon"></i>';
        contactStatus.className = 'contact__message sending';
        contactStatus.textContent = 'Sending your message...';

        const payload = {
            name: name,
            email: email,
            message: message,
            timestamp: Date.now()
        };

        try {
            const response = await fetch(FIREBASE_DB_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.error || 'Failed to submit form to Firebase');
            }

            contactStatus.className = 'contact__message success';
            contactStatus.textContent = 'Thank you! Your message has been sent successfully.';
            contactForm.reset();
            setTimeout(() => {
                contactStatus.textContent = '';
                contactStatus.className = 'contact__message';
            }, 6000);
        } catch (error) {
            console.error('Contact form submission error:', error);
            contactStatus.className = 'contact__message error';
            contactStatus.textContent = 'Something went wrong. Please try again or reach out directly via email.';
        } finally {
            contactButton.disabled = false;
            contactButton.innerHTML = originalButtonHtml;
        }
    });
}


/*==================== ABOUT VIDEO PLAY ON CLICK ====================*/
const aboutMediaWrapper = document.getElementById('about-media-wrapper');
const aboutImg = document.getElementById('about-img');
const aboutPlayBtn = document.getElementById('about-play-btn');
const aboutVideo = document.getElementById('about-video');

if (aboutMediaWrapper && aboutVideo) {
    const showImage = () => {
        aboutVideo.pause();
        aboutVideo.currentTime = 0;
        aboutVideo.style.display = 'none';
        if (aboutImg) aboutImg.style.display = 'block';
        if (aboutPlayBtn) aboutPlayBtn.style.display = 'none';
    };

    const playAboutVideo = () => {
        if (aboutImg) aboutImg.style.display = 'none';
        if (aboutPlayBtn) aboutPlayBtn.style.display = 'none';
        aboutVideo.style.display = 'block';
        aboutVideo.play().catch(err => {
            console.log('Video play error:', err);
        });
    };

    aboutMediaWrapper.addEventListener('click', () => {
        if (aboutVideo.style.display === 'block') {
            showImage();
        } else {
            playAboutVideo();
        }
    });

    // When the video ends, seamlessly return to displaying the image
    aboutVideo.addEventListener('ended', showImage);
}

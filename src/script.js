// ─── CONTENT LOADING (content.json) ───
    // Loaded synchronously so every piece of code below (including the 3D
    // scene IIFE, which runs immediately at parse time) can rely on CONTENT
    // being populated before it runs. Falls back to whatever text is already
    // baked into the HTML if content.json can't be reached.
    let CONTENT = null;
    (function loadContent() {
      try {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', 'content.json', false); // synchronous, same-folder file
        xhr.send(null);
        if (xhr.status === 200 || xhr.status === 0) {
          CONTENT = JSON.parse(xhr.responseText);
        }
      } catch (e) {
        console.warn('content.json could not be loaded — falling back to built-in page text.', e);
      }
      if (!CONTENT) CONTENT = {};
    })();

    // Small helpers for safely applying content to the DOM.
    function setText(id, value) {
      if (value === undefined || value === null) return;
      const el = document.getElementById(id);
      if (el) el.textContent = value;
    }
    function setHtml(id, value) {
      if (value === undefined || value === null) return;
      const el = document.getElementById(id);
      if (el) el.innerHTML = value;
    }

    // ─── APPLY STATIC CONTENT FROM content.json ───
    function applyStaticContent() {
      const C = CONTENT || {};

      if (C.meta && C.meta.title) { document.title = C.meta.title; }

      // Intro
      if (C.intro) {
        setText('introChapterLabel', C.intro.chapterLabel);
        // Built as a single innerHTML write (rather than separate <span id="">
        // wrappers) because style.css has a generic ".intro h1 span" rule that
        // would otherwise paint plain wrapper spans as yellow pill badges —
        // only the .bleed-word span is meant to get that treatment.
        const introTitleEl = document.getElementById('introTitle');
        if (introTitleEl && (C.intro.titleLine1 || C.intro.titleLine2 || C.intro.titleBleed)) {
          const line1 = C.intro.titleLine1 != null ? C.intro.titleLine1 : 'Where Does';
          const line2 = C.intro.titleLine2 != null ? C.intro.titleLine2 : 'the Internet';
          const bleed = C.intro.titleBleed != null ? C.intro.titleBleed : 'Live?';
          introTitleEl.innerHTML = `${line1}<br>${line2} <span class="bleed-word">${bleed}</span>`;
        }
        setText('introSubtitle', C.intro.subtitle);
        if (Array.isArray(C.intro.badges)) {
          C.intro.badges.forEach((t, i) => setText('introBadge' + i, t));
        }
        if (Array.isArray(C.intro.pills)) {
          C.intro.pills.forEach((t, i) => setText('introPill' + i, t));
        }
      }

      // Guides
      if (C.guides) {
        setHtml('guideWelcomeText', C.guides.welcome);
        setHtml('guideQuizText', C.guides.quizIntro);
        if (C.guides.powerPrediction) {
          setHtml('guidePowerText', C.guides.powerPrediction.text);
          const el = document.getElementById('guidePowerPredict');
          if (el && C.guides.powerPrediction.answerLabel) el.setAttribute('data-answer-label', C.guides.powerPrediction.answerLabel);
          if (el && Array.isArray(C.guides.powerPrediction.options)) {
            const btns = el.querySelectorAll('.guide-predict-btn');
            C.guides.powerPrediction.options.forEach((opt, i) => {
              if (btns[i]) { btns[i].textContent = opt.text; btns[i].setAttribute('data-correct', !!opt.correct); }
            });
          }
        }
        if (C.guides.waterPrediction) {
          setHtml('guideWaterText', C.guides.waterPrediction.text);
          const el = document.getElementById('guideWaterPredict');
          if (el && C.guides.waterPrediction.answerLabel) el.setAttribute('data-answer-label', C.guides.waterPrediction.answerLabel);
          if (el && Array.isArray(C.guides.waterPrediction.options)) {
            const btns = el.querySelectorAll('.guide-predict-btn');
            C.guides.waterPrediction.options.forEach((opt, i) => {
              if (btns[i]) { btns[i].textContent = opt.text; btns[i].setAttribute('data-correct', !!opt.correct); }
            });
          }
        }
      }

      // Pretraining
      if (C.pretrain) {
        setText('pretrainLabel', C.pretrain.label);
        setText('pretrainTitle', C.pretrain.title);
        setText('pretrainSub', C.pretrain.sub);
        if (Array.isArray(C.pretrain.terms)) {
          const grid = document.getElementById('pretrainGrid');
          if (grid) {
            grid.innerHTML = C.pretrain.terms.map(t => `
      <div class="pretrain-card">
        <span class="pt-icon">${t.icon}</span>
        <span class="pt-term">${t.term}</span>
        <span class="pt-def">${t.def}</span>
        <span class="pt-hint">${t.hint}</span>
      </div>`).join('');
          }
        }
      }

      // Horizontal panels (Ch. 01–03)
      if (Array.isArray(C.panels)) {
        C.panels.forEach((p, i) => {
          setHtml('panel' + i + 'ChapterLabel', p.chapterLabel);
          setText('panel' + i + 'Tag', p.tag);
          setText('panel' + i + 'Title', p.title);
          setHtml('panel' + i + 'Text', p.textHtml);
          if (p.check) {
            setHtml('ic1Question', p.check.question);
            if (Array.isArray(p.check.options)) {
              p.check.options.forEach((opt, j) => {
                const btn = document.getElementById('ic1Btn' + j);
                if (btn) { btn.textContent = opt.text; btn.setAttribute('data-correct', !!opt.correct); }
              });
            }
          }
        });
      }

      // Power section
      if (C.power) {
        setHtml('powerChapterLabel', C.power.chapterLabel);
        setText('powerTitle', C.power.title);
        setText('powerSub', C.power.sub);
        if (Array.isArray(C.power.bars)) {
          C.power.bars.forEach((b, i) => {
            const n = i + 1;
            setHtml('barLabel' + n, (b.labelMain || '') + '<br><small>' + (b.labelSmall || '') + '</small>');
            setText('barVal' + n, b.val);
          });
        }
      }

      // Water section
      if (C.water) {
        setText('waterTitle', C.water.title);
        setText('waterDesc', C.water.desc);
        setText('waterLabel', C.water.statLabel);
        setText('waterRightMain', C.water.rightMain);
        setText('waterRightSub', C.water.rightSub);
      }

      // Message journey
      if (C.journey) {
        setText('journeyTitle', C.journey.title);
        setText('journeySub', C.journey.sub);
        if (Array.isArray(C.journey.steps)) {
          C.journey.steps.forEach((s, i) => {
            setText('jStepIcon' + i, s.icon);
            setText('jStepName' + i, s.name);
          });
        }
        setText('jDesc', C.journey.initialDesc);
        setHtml('jSpeed', C.journey.speedTextHtml);
      }

      // E-waste
      if (C.ewaste) {
        setText('ewasteTitle', C.ewaste.title);
        setText('ewasteSub', C.ewaste.sub);
        if (Array.isArray(C.ewaste.rows)) {
          C.ewaste.rows.forEach((r, i) => {
            const iconEl = document.getElementById('ewasteIcon' + i);
            if (iconEl) {
              iconEl.textContent = r.icon;
              if (r.iconBg) iconEl.style.background = r.iconBg;
              if (r.iconColor) iconEl.style.color = r.iconColor;
            }
            setHtml('ewasteLabel' + i, r.label);
            setText('ewasteDesc' + i, r.desc);
            setText('ewasteYear' + i, r.year);
          });
        }
        setHtml('ewasteFinalNote', C.ewaste.finalNoteHtml);
      }

      // Flip facts intro
      if (C.flip) {
        setText('flipChapterLabel', C.flip.chapterLabel);
        setText('flipTitle', C.flip.title);
        setText('flipSub', C.flip.sub);
      }

      // 3D model
      if (C.dc3d) {
        setText('dc3dTitle', C.dc3d.title);
        setText('dc3dSub', C.dc3d.sub);
        if (Array.isArray(C.dc3d.topbarLabels)) {
          setText('dc3dTopbarLabel0', C.dc3d.topbarLabels[0]);
          setText('dc3dTopbarLabel1', C.dc3d.topbarLabels[1]);
          setText('dc3dTopbarLabel2', C.dc3d.topbarLabels[2]);
        }
        setText('dc3d-fullscreen-label', C.dc3d.fullscreenLabel);
      }

      // Map
      if (C.map) {
        setText('mapChapterLabel', C.map.chapterLabel);
        setText('mapTitle', C.map.title);
        setText('mapDesc1', C.map.desc1);
        setText('mapDesc2', C.map.desc2);
      }

      // Quiz intro
      if (C.quiz) {
        setText('quizTitleLine1', C.quiz.titleLine1);
        setText('quizTitleLine2', C.quiz.titleLine2);
        setText('quizIntroText', C.quiz.intro);
        if (Array.isArray(C.quiz.features)) {
          C.quiz.features.forEach((f, i) => {
            setText('quizFeatureIcon' + i, f.icon);
            setText('quizFeatureText' + i, f.text);
          });
        }
      }

      // Footer
      if (C.footer) setText('footerText', C.footer.text);
    }
    applyStaticContent();

    // ─── SCROLL RESTORATION FIX ───
    history.scrollRestoration = 'manual';
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });

    // ─── VOICE NARRATION SYSTEM (scroll-driven) ───
    const AutoNarrator = {
      synth: null,
      isPlaying: false,
      currentSection: null,
      isEnabled: true,
      speaking: false,
      _token: 0,
      _resumeTimer: null,
      _watchdog: null,

      init() {
        document.getElementById('audioToggleBtn').addEventListener('click', () => this.toggleGlobal());
        if (!('speechSynthesis' in window)) {
          document.querySelectorAll('.audio-badge').forEach(b => b.style.opacity = '0.4');
          return;
        }
        this.synth = window.speechSynthesis;
        this.synth.getVoices();
        this.synth.onvoiceschanged = () => this.synth.getVoices();
        this.updateUI();
        this.setupScrollListener();

        // Tabs backgrounded/foregrounded: Chrome silently drops speech when hidden.
        document.addEventListener('visibilitychange', () => {
          if (document.hidden) this.stopAll();
          else this.updateCurrentSection();
        });

        // Chrome bug: long utterances auto-stop after ~15s unless nudged, and
        // `speaking` can get stuck true after a tab-switch or engine hiccup.
        // A periodic pause/resume + liveness check keeps narration reliable.
        this._watchdog = setInterval(() => {
          if (!this.speaking) return;
          if (!this.synth.speaking) { this.speaking = false; this.isPlaying = false; this.updateUI(); return; }
          this.synth.pause();
          this.synth.resume();
        }, 4000);
      },

      getVoice() {
        if (!this.synth) return null;
        const voices = this.synth.getVoices();
        return voices.find(v => v.lang.startsWith('en') && v.name.includes('Google')) ||
          voices.find(v => v.lang.startsWith('en')) ||
          voices[0] || null;
      },

      toggleGlobal() {
        this.isEnabled = !this.isEnabled;
        if (!this.isEnabled) this.stopAll();
        this.updateUI();
        // if turning on, immediately check current section
        if (this.isEnabled) {
          this.updateCurrentSection();
        }
      },

      updateUI() {
        const label = document.getElementById('audioToggleLabel');
        const icon = document.getElementById('waveIcon');
        const btn = document.getElementById('audioToggleBtn');
        const status = document.getElementById('audioStatus');
        if (label) label.textContent = this.isEnabled ? 'Narration: On' : 'Narration: Off';
        if (icon) icon.classList.toggle('off', !this.isEnabled);
        if (btn) btn.classList.toggle('playing', this.isEnabled && this.isPlaying);

        // Update status box
        if (this.isEnabled && this.currentSection && this.currentSection !== 'silent') {
          status.classList.add('show');
          document.getElementById('audioStatusText').textContent = this.getSectionLabel(this.currentSection);
        } else {
          status.classList.remove('show');
          document.getElementById('audioStatusText').textContent = '';
        }

        // Update all badges
        document.querySelectorAll('.audio-badge').forEach(b => {
          const sec = b.id ? b.id.replace('badge-', '') : null;
          const isActive = this.isEnabled && this.isPlaying && sec === this.currentSection;
          b.classList.toggle('playing-badge', isActive);
          b.textContent = isActive ? '🔊 Playing...' : '🔊 Auto-narrated';
        });
      },

      getSectionLabel(section) {
        const map = (CONTENT.narration && CONTENT.narration.sectionLabels) || {};
        return map[section] || section;
      },

      getSectionText(section) {
        const map = (CONTENT.narration && CONTENT.narration.sectionText) || {};
        return map[section] || '';
      },

      speakSection(section) {
        if (!this.isEnabled || !this.synth) return;
        // Already speaking this section — let it continue uninterrupted
        if (this.speaking && this.currentSection === section) return;

        const text = this.getSectionText(section);
        if (!text) return;

        this.stopAll();
        this.currentSection = section;
        this.isPlaying = true;
        this.speaking = true;
        this.updateUI();

        // Chrome can silently swallow speak() called right after cancel();
        // a short delay + token guard avoids stale/overlapping utterances.
        const token = ++this._token;
        clearTimeout(this._resumeTimer);
        this._resumeTimer = setTimeout(() => {
          if (token !== this._token || !this.isEnabled) return;
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.rate = 0.7;
          utterance.pitch = 1.07;
          utterance.volume = 0.5;
          const voice = this.getVoice();
          if (voice) utterance.voice = voice;
          utterance.onend = utterance.onerror = () => {
            if (token !== this._token) return;
            this.isPlaying = false;
            this.speaking = false;
            this.updateUI();
          };
          this.synth.speak(utterance);
        }, 60);
      },

      stopAll() {
        this._token++;
        clearTimeout(this._resumeTimer);
        if (this.synth) this.synth.cancel();
        this.isPlaying = false;
        this.speaking = false;
        this.updateUI();
      },

      // ─── Scroll-driven section detection ───
      setupScrollListener() {
        let ticking = false;
        window.addEventListener('scroll', () => {
          if (!ticking) {
            window.requestAnimationFrame(() => {
              this.updateCurrentSection();
              ticking = false;
            });
            ticking = true;
          }
        });
        // initial call
        setTimeout(() => this.updateCurrentSection(), 200);
      },

      updateCurrentSection() {
        if (!this.isEnabled) return;

        const sections = document.querySelectorAll('[data-section]');
        let bestSection = null;
        let bestArea = 0;

        for (const el of sections) {
          const rect = el.getBoundingClientRect();
          // Visible width/height in the viewport. Using visible *area* (rather
          // than distance to the vertical center) is what correctly handles
          // the h-panels: they all share one vertical position and only
          // differ by how much of their width is scrolled into view.
          const visibleW = Math.min(rect.right, window.innerWidth) - Math.max(rect.left, 0);
          const visibleH = Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0);
          if (visibleW <= 0 || visibleH <= 0) continue;
          const area = visibleW * visibleH;
          if (area > bestArea) {
            bestArea = area;
            bestSection = el;
          }
        }

        const section = bestSection && bestSection.dataset.section;
        const text = section && this.getSectionText(section);

        // Silent section (or nothing visible): stop narration, clear label
        if (!text) {
          if (this.speaking) this.stopAll();
          if (this.currentSection !== null) { this.currentSection = null; this.updateUI(); }
          return;
        }
        if (section !== this.currentSection) this.speakSection(section);
      }
    };

    // ─── MAIN INIT ───
    window.addEventListener('load', function() {
      gsap.registerPlugin(ScrollTrigger);

      // Init voice narration
      AutoNarrator.init();

      // ── Progress bar ──
      const progBar = document.getElementById('progressBar');
      window.addEventListener('scroll', () => { progBar.style.width = Math.min((scrollY / (document.body
          .scrollHeight - innerHeight)) * 100, 100) + '%' }, { passive: true });

      // ── Horizontal track ──
      const hTrack = document.getElementById('hTrack'),
        pDots = document.querySelectorAll('#panelDots .panel-dot'),
        hArrow = document.getElementById('hArrow'),
        wrap1El = document.getElementById('wrap1');
      let hTargetProgress = 0,
        hCurrentProgress = 0,
        hLastRendered = -1;

      function computeHTargetProgress() {
        const wrapTop = wrap1El.getBoundingClientRect().top,
          wrapH = wrap1El.offsetHeight,
          vh = innerHeight;
        const scrolled = -wrapTop,
          maxScroll = wrapH - vh;
        hTargetProgress = Math.max(0, Math.min(1, scrolled / maxScroll));
      }

      function renderHTrack() {
        hCurrentProgress += (hTargetProgress - hCurrentProgress) * 0.12;
        if (Math.abs(hTargetProgress - hCurrentProgress) < 0.0005) hCurrentProgress = hTargetProgress;
        if (Math.abs(hCurrentProgress - hLastRendered) > 0.0001) {
          hLastRendered = hCurrentProgress;
          hTrack.style.transform = 'translateX(-' + (hCurrentProgress * 200) + 'vw)';
          const idx = Math.min(Math.floor(hCurrentProgress * 3 + 0.01), 2);
          pDots.forEach((d, i) => { d.style.background = i === idx ? 'rgba(255,254,249,0.9)' :
              'rgba(255,254,249,0.3)' });
          if (hArrow) hArrow.style.display = hCurrentProgress > 0.9 ? 'none' : 'block';
        }
        requestAnimationFrame(renderHTrack);
      }
      computeHTargetProgress();
      hCurrentProgress = hTargetProgress;
      window.addEventListener('scroll', computeHTargetProgress, { passive: true });
      window.addEventListener('resize', computeHTargetProgress, { passive: true });
      requestAnimationFrame(renderHTrack);

      // ── Inline knowledge checks ──
      document.querySelectorAll('.inline-check .ic-btn').forEach(btn => {
        btn.addEventListener('click', function() {
          const container = this.closest('.inline-check');
          const fb = container.querySelector('.ic-fb');
          const isCorrect = this.getAttribute('data-correct') === 'true';
          const allBtns = container.querySelectorAll('.ic-btn');
          allBtns.forEach(b => {
            b.disabled = true;
            b.classList.remove('selected');
          });
          this.classList.add('selected');
          if (isCorrect) {
            fb.textContent = '✅ Correct!';
            fb.className = 'ic-fb';
            if (window.launchConfetti) window.launchConfetti();
          } else {
            const wrongMsg = (CONTENT.panels && CONTENT.panels[0] && CONTENT.panels[0].check &&
              CONTENT.panels[0].check.wrongFeedback) || '❌ Not quite. Think about what\'s inside a data center.';
            fb.textContent = wrongMsg;
            fb.className = 'ic-fb wrong';
            allBtns.forEach(b => {
              if (b.getAttribute('data-correct') === 'true') b.classList.add('selected');
            });
          }
        });
      });

      // ── Guide prediction prompts ──
      const PREDICT_FEEDBACK = CONTENT.predictFeedback || {};
      document.querySelectorAll('.guide-predict-input').forEach(group => {
        const buttons = group.querySelectorAll('.guide-predict-btn');
        const reveal = group.parentElement.querySelector('.guide-predict-reveal');
        const answerLabel = group.getAttribute('data-answer-label');
        buttons.forEach(btn => {
          btn.addEventListener('click', () => {
            if (group.dataset.answered === 'true') return;
            group.dataset.answered = 'true';
            const isCorrect = btn.getAttribute('data-correct') === 'true';
            buttons.forEach(b => {
              b.classList.remove('chosen', 'is-correct', 'reveal-correct');
              b.disabled = true;
            });
            btn.classList.add('chosen');
            if (isCorrect) btn.classList.add('is-correct');
            else {
              const rightBtn = [...buttons].find(b => b.getAttribute('data-correct') === 'true');
              if (rightBtn) rightBtn.classList.add('reveal-correct');
            }
            if (reveal) {
              const chosenText = btn.textContent.trim();
              const feedback = PREDICT_FEEDBACK[chosenText] ||
                `The real answer is <strong>${answerLabel}</strong>.`;
              reveal.innerHTML =
                `<span class="rev-icon">${isCorrect ? '✅' : '📊'}</span><span class="rev-text">${feedback}<span class="rev-next">Keep scrolling, I'll show you 👇</span></span>`;
              reveal.classList.add('shown');
            }
          });
        });
      });

      // ── E-waste scroll ──
      const eRows = document.querySelectorAll('.ewaste-row');
      const eStageColors = ['#FFFEF9', '#f0faf4', '#eef5ff', '#f7f0f5'];
      const wrap6 = document.getElementById('wrap6');
      let activeStage = -1;

      function updateEwasteRows(stageIdx) {
        eRows.forEach((row, i) => { row.classList.toggle('active', i <= stageIdx); });
        if (wrap6) { const colorIdx = Math.min(stageIdx, 3);
          wrap6.style.background = eStageColors[colorIdx]; }
        activeStage = stageIdx;
      }

      function updateEwasteFromScroll() {
        const rect = wrap6.getBoundingClientRect();
        const vh = window.innerHeight;
        const progress = Math.max(0, Math.min(1, (vh * 0.85 - rect.top) / (vh * 0.85)));
        const stage = progress === 0 ? -1 : Math.min(3, Math.floor(progress * 4));
        if (stage !== activeStage) updateEwasteRows(stage);
        if (rect.bottom < 0) {
          eRows.forEach(row => row.classList.remove('active'));
          if (wrap6) wrap6.style.background = '#FFFEF9';
          activeStage = -1;
        }
      }
      window.addEventListener('scroll', updateEwasteFromScroll, { passive: true });
      updateEwasteFromScroll();

      // ── Map ──
      const mapData = CONTENT.map || {};
      const mapCenter = mapData.center || { lat: 27.7172, lng: 85.3240, zoom: 8 };
      const map = L.map('nepalMap', { scrollWheelZoom: false, dragging: true, zoomControl: true }).setView(
        [mapCenter.lat, mapCenter.lng], mapCenter.zoom);
      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', { attribution: '&copy; OSM &copy; CARTO',
        subdomains: 'abcd', maxZoom: 19 }).addTo(map);
      (mapData.markers || [
        { lat: 27.7172, lng: 85.3240, color: '#AF9ED7', popup: 'Kathmandu Valley — 8 data centers' },
        { lat: 27.7005, lng: 83.4485, color: '#FDC9B4', popup: 'Butwal — 1 data center' }
      ]).forEach(m => {
        const icon = L.divIcon({ html: `<div style="background:${m.color};width:16px;height:16px;border-radius:50%;border:3px solid #FFFEF9;box-shadow:0 2px 8px rgba(0,0,0,0.2);"></div>`,
          iconSize: [22, 22], iconAnchor: [11, 11], className: '' });
        L.marker([m.lat, m.lng], { icon }).addTo(map).bindPopup(m.popup);
      });
      const circleData = mapData.circle || { lat: 27.7172, lng: 85.3240, radius: 28000, color: '#AF9ED7' };
      L.circle([circleData.lat, circleData.lng], { radius: circleData.radius, color: circleData.color,
        fillColor: circleData.color, fillOpacity: 0.1, weight: 2, dashArray: '6 8' }).addTo(map);

      // ── Quiz ──
      const QUESTIONS = (CONTENT.quiz && CONTENT.quiz.questions) || [];
      let qIndex = 0,
        score = 0,
        answered = false;
      const qProg = document.getElementById('quizProgress'),
        qQuestion = document.getElementById('quizQuestion'),
        qBtns = document.getElementById('quizBtns'),
        qFb = document.getElementById('quizFb'),
        qSc = document.getElementById('quizScore'),
        nBtn = document.getElementById('nextBtn'),
        rBtn = document.getElementById('retryBtn');

      function renderQuestion() {
        const q = QUESTIONS[qIndex];
        qProg.textContent = `Question ${qIndex + 1} of ${QUESTIONS.length}`;
        qQuestion.textContent = q.q;
        qFb.textContent = '';
        answered = false;
        qBtns.innerHTML = '';
        q.opts.forEach((opt, i) => {
          const b = document.createElement('button');
          b.className = 'quiz-btn';
          b.textContent = opt;
          b.addEventListener('click', () => handleAnswer(i));
          qBtns.appendChild(b);
        });
        rBtn.style.display = 'none';
        nBtn.style.display = 'none';
      }

      function handleAnswer(i) {
        if (answered) return;
        answered = true;
        const q = QUESTIONS[qIndex];
        const btns = qBtns.querySelectorAll('.quiz-btn');
        btns.forEach(b => b.disabled = true);
        if (i === q.correct) {
          btns[i].classList.add('right');
          qFb.style.color = '#91C8A9';
          qFb.textContent = '✓ Correct! ' + q.explain;
          score++;
          if (window.launchConfetti) window.launchConfetti();
          nBtn.style.display = 'inline-block';
        } else {
          btns[i].classList.add('wrong');
          btns[q.correct].classList.add('right');
          qFb.style.color = '#FDC9B4';
          qFb.textContent = '✗ ' + q.explain;
          nBtn.style.display = 'inline-block';
        }
        qSc.textContent = `Score: ${score}/${QUESTIONS.length}`;
      }

      function advanceQuestion() {
        nBtn.style.display = 'none';
        qIndex++;
        if (qIndex < QUESTIONS.length) { renderQuestion(); } else {
          const rm = (CONTENT.quiz && CONTENT.quiz.resultMessages) || {};
          qQuestion.textContent = score >= 4 ? (rm.high || '🎉 Amazing! You know your data centers!') : score >= 2 ?
            (rm.mid || '👍 Good effort! Keep exploring!') : (rm.low || '📚 Keep learning!');
          qBtns.innerHTML = '';
          qProg.textContent = 'Finished!';
          rBtn.style.display = 'inline-block';
        }
      }
      nBtn.addEventListener('click', advanceQuestion);
      window.startQuiz = function() {
        qIndex = 0;
        score = 0;
        qSc.textContent = `Score: 0/${QUESTIONS.length}`;
        qFb.textContent = '';
        rBtn.style.display = 'none';
        nBtn.style.display = 'none';
        renderQuestion();
      };
      startQuiz();

      // ── Confetti ──
      const confCanvas = document.getElementById('confettiCanvas'),
        confCtx = confCanvas ? confCanvas.getContext('2d') : null;
      let confPieces = [],
        confRaf = null;
      window.launchConfetti = function() {
        if (!confCanvas || !confCtx) return;
        confCanvas.style.display = 'block';
        confCanvas.width = window.innerWidth;
        confCanvas.height = window.innerHeight;
        const colors = ['#AF9ED7', '#FDE688', '#FDC9B4', '#77C0F7', '#91C8A9'];
        confPieces = Array.from({ length: 80 }, () => ({ x: Math.random() * confCanvas.width, y: -10,
          w: 8 + Math.random() * 8, h: 14 + Math.random() * 10, color: colors[Math.floor(Math.random() *
            colors.length)], rot: Math.random() * 360, rotV: (Math.random() - 0.5) * 8,
          vx: (Math.random() - 0.5) * 4, vy: 2 + Math.random() * 4, alpha: 1 }));
        if (confRaf) cancelAnimationFrame(confRaf);

        function drawConf() {
          confCtx.clearRect(0, 0, confCanvas.width, confCanvas.height);
          let alive = false;
          confPieces.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.rot += p.rotV;
            p.alpha -= 0.008;
            if (p.alpha <= 0) return;
            alive = true;
            confCtx.save();
            confCtx.globalAlpha = p.alpha;
            confCtx.translate(p.x, p.y);
            confCtx.rotate(p.rot * Math.PI / 180);
            confCtx.fillStyle = p.color;
            confCtx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
            confCtx.restore();
          });
          if (alive) confRaf = requestAnimationFrame(drawConf);
          else { confCanvas.style.display = 'none';
            confCtx.clearRect(0, 0, confCanvas.width, confCanvas.height); }
        }
        confRaf = requestAnimationFrame(drawConf);
      };

      // ── Guide band scroll-reveal ──
      const guideBands = document.querySelectorAll('.guide-band');
      if (guideBands.length) {
        const guideObs = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              entry.target.classList.add('in-view');
              guideObs.unobserve(entry.target);
            }
          });
        }, { threshold: 0.22, rootMargin: '0px 0px -8% 0px' });
        guideBands.forEach(band => guideObs.observe(band));
      }

      // ── General heading/content fade-up reveal ──
      const revealEls = document.querySelectorAll('.reveal-up');
      if (revealEls.length) {
        const revealObs = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              entry.target.classList.add('in-view');
              revealObs.unobserve(entry.target);
            }
          });
        }, { threshold: 0.15, rootMargin: '0px 0px -6% 0px' });
        revealEls.forEach(el => revealObs.observe(el));
      }

      // ── Intro particle network ──
      (function() {
        const canvas = document.getElementById('introCanvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let W, H, pts, rafId = null,
          visible = true;
        const COUNT = 38,
          CONN_DIST = 140,
          CONN_DIST_SQ = CONN_DIST * CONN_DIST,
          colors = ['#AF9ED7', '#77C0F7', '#91C8A9', '#FDC9B4', '#FDE688'];

        function resize() { W = canvas.width = canvas.offsetWidth;
          H = canvas.height = canvas.offsetHeight; }

        function initPts() {
          pts = Array.from({ length: COUNT }, () => ({ x: Math.random() * W, y: Math.random() * H,
            vx: (Math.random() - 0.5) * 0.5, vy: (Math.random() - 0.5) * 0.5,
            r: 2 + Math.random() * 3, color: colors[Math.floor(Math.random() * colors.length)] }));
        }

        function draw() {
          if (!visible) { rafId = null; return; }
          rafId = requestAnimationFrame(draw);
          ctx.clearRect(0, 0, W, H);
          ctx.beginPath();
          ctx.lineWidth = 1;
          for (let i = 0; i < pts.length; i++) {
            for (let j = i + 1; j < pts.length; j++) {
              const dx = pts[i].x - pts[j].x,
                dy = pts[i].y - pts[j].y;
              const dSq = dx * dx + dy * dy;
              if (dSq < CONN_DIST_SQ) {
                ctx.moveTo(pts[i].x, pts[i].y);
                ctx.lineTo(pts[j].x, pts[j].y);
              }
            }
          }
          ctx.strokeStyle = 'rgba(175,158,215,0.12)';
          ctx.stroke();
          ctx.globalAlpha = 0.45;
          pts.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            if (p.x < 0 || p.x > W) p.vx *= -1;
            if (p.y < 0 || p.y > H) p.vy *= -1;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.fill();
          });
          ctx.globalAlpha = 1;
        }
        const obs = new IntersectionObserver(entries => {
          visible = entries[0].isIntersecting;
          if (visible && !rafId) rafId = requestAnimationFrame(draw);
        }, { threshold: 0 });
        obs.observe(canvas);
        resize();
        initPts();
        rafId = requestAnimationFrame(draw);
        window.addEventListener('resize', () => { resize();
          initPts(); });
      })();

      // ─── SCROLLTRIGGER INIT ───
      function initScrollTriggers() {
        // 1. Power bars
        const defaultBarMaxes = [100, 62, 20, 9];
        const powerBars = (CONTENT.power && CONTENT.power.bars) || [];
        [1, 2, 3, 4].map(n => ({ id: 'bar' + n, max: (powerBars[n - 1] && powerBars[n - 1].max) || defaultBarMaxes[n - 1] }))
        .forEach(({ id, max }) => {
          const el = document.getElementById(id);
          if (el) el.style.width = '0%';
          ScrollTrigger.create({
            trigger: "#wrap3",
            start: "top top",
            end: "bottom bottom",
            scrub: true,
            onUpdate: self => {
              const el2 = document.getElementById(id);
              if (el2) el2.style.width = Math.min(self.progress * max * 1.6, max) + '%';
            }
          });
        });

        // 2. Water counter
        const waterStat = document.getElementById('waterStat');
        if (waterStat) waterStat.textContent = '0';
        const waterTarget = (CONTENT.water && CONTENT.water.target) || 230000000;
        let waterRaf = null,
          waterCurrentVal = 0,
          waterVisible = false;

        function animateWaterTo(target) {
          if (waterRaf) cancelAnimationFrame(waterRaf);
          const start = waterCurrentVal,
            dur = 1600,
            startTime = performance.now();

          function tick(now) {
            const p = Math.min((now - startTime) / dur, 1);
            const eased = 1 - Math.pow(1 - p, 3);
            waterCurrentVal = Math.round(start + (target - start) * eased);
            const el = document.getElementById('waterStat');
            if (el) el.textContent = waterCurrentVal.toLocaleString();
            if (p < 1) waterRaf = requestAnimationFrame(tick);
          }
          waterRaf = requestAnimationFrame(tick);
        }
        ScrollTrigger.create({
          trigger: "#wrap4",
          start: "top 85%",
          end: "bottom top",
          onEnter: () => { if (!waterVisible) { waterVisible = true;
              animateWaterTo(waterTarget); } },
          onLeaveBack: () => { waterVisible = false;
            animateWaterTo(0); },
        });

        // 3. Journey
        const jDesc = document.getElementById('jDesc'),
          jSpeed = document.getElementById('jSpeed'),
          jPulseDot = document.getElementById('jPulseDot'),
          jDescBgNum = document.getElementById('jDescBgNum');
        const descs = (CONTENT.journey && CONTENT.journey.descs) || [
          'Your message starts on your phone.',
          'It travels as radio waves to a cell tower.',
          'The tower sends it to a data center in Kathmandu.',
          'The data center delivers it to your friend.'
        ];
        const bgNums = descs.map((_, i) => String(i + 1));
        for (let i = 0; i < 4; i++) {
          const step = document.getElementById('jStep' + i);
          const conn = document.getElementById('jConn' + i);
          if (step) step.classList.remove('on');
          if (conn) conn.classList.remove('on');
        }
        if (jDesc) jDesc.textContent = 'Your message starts on your phone...';
        if (jDescBgNum) jDescBgNum.textContent = '1';
        if (jPulseDot) jPulseDot.style.left = '0%';
        if (jSpeed) jSpeed.style.opacity = '0';
        ScrollTrigger.create({
          trigger: "#wrap5",
          start: "top top",
          end: "bottom bottom",
          scrub: 0.3,
          onUpdate: self => {
            const idx = Math.min(Math.floor(self.progress * 4), 3);
            if (jDesc) jDesc.textContent = descs[idx];
            if (jDescBgNum) jDescBgNum.textContent = bgNums[idx];
            for (let i = 0; i < 4; i++) {
              const step = document.getElementById('jStep' + i);
              const conn = document.getElementById('jConn' + i);
              if (step) step.classList.toggle('on', i <= idx);
              if (conn) conn.classList.toggle('on', i < idx);
            }
            if (jSpeed) jSpeed.style.opacity = self.progress > 0.8 ? 1 : 0;
            if (jPulseDot) jPulseDot.style.left = (self.progress * 96) + '%';
          }
        });

        // 4. Parallax watermarks
        const powerWm = document.getElementById('powerWm');
        const flipWm = document.getElementById('flipWm');
        if (powerWm) {
          powerWm.style.transform = 'translateY(0px) rotate(0deg)';
          ScrollTrigger.create({
            trigger: '#wrap3',
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1.5,
            onUpdate: self => {
              powerWm.style.transform =
                `translateY(${(self.progress - 0.5) * -80}px) rotate(${self.progress * 8}deg)`;
            }
          });
        }
        if (flipWm) {
          flipWm.style.transform = 'translateY(0px)';
          ScrollTrigger.create({
            trigger: '#wrap7',
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1.5,
            onUpdate: self => {
              flipWm.style.transform =
                `translateY(${(self.progress - 0.5) * -100}px)`;
            }
          });
        }

        // 5. Flip cards
        const flipInner = document.getElementById('flipInner'),
          ffTitle = document.getElementById('ffTitle'),
          fbTitle = document.getElementById('fbTitle'),
          fbText = document.getElementById('fbText'),
          flipDots = document.querySelectorAll('#flipDots .flip-dot');
        const facts = (CONTENT.flip && CONTENT.flip.facts) || [
          { title: 'They Get Really Hot', text: 'Cooling is one of the biggest challenges.' },
          { title: 'Super Secure', text: 'Fingerprint scanners and tall fences protect your data.' },
          { title: 'Nepal Could Be Perfect', text: 'Cool mountain weather means natural air conditioning.' },
          { title: 'They Use Water Too', text: 'Millions of litres of water daily for cooling.' }
        ];
        let cf = 0,
          flipped = false;

        function updateFlipCard(idx) {
          ffTitle.textContent = facts[idx].title;
          fbTitle.textContent = facts[idx].title;
          fbText.textContent = facts[idx].text;
          flipDots.forEach((d, i) => { d.classList.toggle('current', i === idx);
            d.style.background = i === idx ? 'rgba(255,254,249,0.9)' : 'rgba(255,254,249,0.3)' });
        }
        if (flipInner) flipInner.classList.remove('flipped');
        updateFlipCard(0);
        cf = 0;
        document.getElementById('flipCard').addEventListener('click', () => { flipped = !flipped;
          if (flipInner) flipInner.classList.toggle('flipped', flipped) });
        ScrollTrigger.create({
          trigger: "#wrap7",
          start: "top top",
          end: "bottom bottom",
          scrub: 0.5,
          onUpdate: self => {
            const idx = Math.min(Math.floor(self.progress * 4), 3);
            if (idx !== cf) { cf = idx;
              flipped = false;
              if (flipInner) flipInner.classList.remove('flipped');
              updateFlipCard(idx) }
          }
        });

        ScrollTrigger.refresh();
      }

      // Delay ScrollTrigger init until after layout settle
      setTimeout(initScrollTriggers, 100);
      window.addEventListener('resize', () => { ScrollTrigger.refresh(); });

    }); // end load

    // ─── 3D SCENE ───
    (function() {
      // Component metadata (labels/colors/descriptions/specs) and the
      // floor-plan layout both come from content.json so the whole scene's
      // "info" is editable without touching this file.
      const DEFAULT_COMPONENTS = {
        server_rack: { label: 'Server Rack', hex: '#77C0F7',
          desc: 'A standard rack of servers that store and process data.', specs: [{ k: 'Units per rack',
              v: '42U' }, { k: 'Power draw', v: '5–10 kW' }, { k: 'Network speed', v: '10–100 Gbps' }] },
        cooling_unit: { label: 'Cooling Unit (CRAC)', hex: '#91C8A9',
          desc: 'Keeps the room at a safe temperature for the servers.', specs: [{ k: 'Capacity', v: '20–60 kW' },
            { k: 'Target temp', v: '18–27°C' }, { k: 'Airflow', v: '3,000–10,000 CFM' }] },
        ups: { label: 'UPS (Battery Backup)', hex: '#FDE688',
          desc: 'A battery backup that kicks in the instant power cuts out.', specs: [{ k: 'Capacity',
              v: '100–500 kVA' }, { k: 'Backup duration', v: '10–15 minutes' }] },
        generator: { label: 'Diesel Generator', hex: '#C87961',
          desc: 'A backup generator that keeps the lights on during longer outages.', specs: [{ k: 'Capacity',
              v: '500 kW – 2 MW' }, { k: 'Start time', v: '< 10 seconds' }] },
        network_core: { label: 'Network Core Switch', hex: '#AF9ED7',
          desc: 'Connects every server rack together at high speed.', specs: [{ k: 'Throughput', v: '100 Tbps+' },
            { k: 'Latency', v: '< 1 µs' }] },
        pdu: { label: 'Power Distribution Unit', hex: '#FFB347',
          desc: 'Sends power from the UPS to each server rack.', specs: [{ k: 'Input voltage', v: '208–415 V AC' },
            { k: 'Outlets', v: '24–48' }] },
        fire_suppression: { label: 'Fire Suppression', hex: '#FF8FAB',
          desc: 'Puts out fires without damaging the equipment.', specs: [{ k: 'Agent', v: 'FM-200 / Novec 1230' },
            { k: 'Response time', v: '< 10 seconds' }] },
        security_desk: { label: 'Security & NOC Desk', hex: '#B0C4DE',
          desc: 'Where staff watch over every system, all day and night.', specs: [{ k: 'Staffing',
              v: '24/7/365' }, { k: 'Access control', v: 'Biometric + badge' }] }
      };
      const DEFAULT_LAYOUT = [
        { type: 'server_rack', positions: [[-6,-5],[-4,-5],[-2,-5],[0,-5],[-6,-3],[-4,-3],[-2,-3],[0,-3],[-6,1],[-4,1],[-2,1],[0,1],[-6,3],[-4,3],[-2,3],[0,3]] },
        { type: 'cooling_unit', positions: [[2,-5],[2,-3],[2,1],[2,3]] },
        { type: 'ups', positions: [[-9,-4],[-9,-2],[-9,0]] },
        { type: 'generator', positions: [[-9,5],[-6,5]] },
        { type: 'network_core', positions: [[4,-1]] },
        { type: 'pdu', positions: [[-1,-7],[2,-7],[5,-4],[5,2]] },
        { type: 'fire_suppression', positions: [[4,-6],[6,-6],[4,5],[6,5]] },
        { type: 'security_desk', positions: [[5,-1]] }
      ];

      const contentComponents = (CONTENT.dc3d && CONTENT.dc3d.components) || DEFAULT_COMPONENTS;
      const COMPONENTS = {};
      Object.keys(contentComponents).forEach(key => {
        const def = contentComponents[key];
        COMPONENTS[key] = { label: def.label, hex: def.hex, desc: def.desc, specs: def.specs,
          color: parseInt(def.hex.replace('#', ''), 16) };
      });
      const LAYOUT = (CONTENT.dc3d && CONTENT.dc3d.layout) || DEFAULT_LAYOUT;

      function buildComponent(type, x, z) {
        const def = COMPONENTS[type],
          col = def.color;
        const mat = (c, e) => new THREE.MeshStandardMaterial({ color: c, emissive: e || 0,
          emissiveIntensity: e ? 0.18 : 0, roughness: 0.55, metalness: 0.35 });
        const g = new THREE.Group();
        g.userData = { type, componentDef: def };
        if (type === 'server_rack') {
          g.add((b => { b.position.y = 1.1; return b })(new THREE.Mesh(new THREE.BoxGeometry(1, 2.2, 0.7), mat(
          col))));
          for (let i = 0; i < 5; i++) { const s = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.06, 0.02), mat(
              0x112233));
            s.position.set(0, 0.4 + i * 0.35, 0.36);
            g.add(s); }
          const l = new THREE.Mesh(new THREE.BoxGeometry(0.05, 1.6, 0.04), mat(0x00ff88, 0x00ff88));
          l.position.set(-0.42, 1.1, 0.36);
          g.add(l);
        } else if (type === 'cooling_unit') {
          g.add((b => { b.position.y = 0.9; return b })(new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.8, 0.9), mat(
          col))));
          for (let i = 0; i < 6; i++) { const l = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.06, 0.08), mat(
              0x1a3a2a));
            l.position.set(0, 0.3 + i * 0.25, 0.46);
            g.add(l); }
          const f = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.08, 16), mat(0x1a3a2a));
          f.rotation.x = Math.PI / 2;
          f.position.set(0, 1.5, 0.48);
          g.add(f);
        } else if (type === 'ups') {
          g.add((b => { b.position.y = 1; return b })(new THREE.Mesh(new THREE.BoxGeometry(0.9, 2, 0.7), mat(
          col))));
          for (let i = 0; i < 4; i++) { const s = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.25, 0.08), mat(
              0x3a3000));
            s.position.set(0, 0.4 + i * 0.38, 0.36);
            g.add(s); }
          const l = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 8), mat(0xffee00, 0xffee00));
          l.position.set(0.3, 1.9, 0.36);
          g.add(l);
        } else if (type === 'generator') {
          g.add((s => { s.position.y = 0.07; return s })(new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.15, 1.1),
            mat(0x2a2a2a))));
          g.add((b => { b.position.y = 0.7; return b })(new THREE.Mesh(new THREE.BoxGeometry(2, 1.1, 1), mat(
          col))));
          const p = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.7, 8), mat(0x444444));
          p.position.set(0.7, 1.6, 0);
          g.add(p);
          for (let i = 0; i < 4; i++) { const v = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.12, 0.8), mat(
              0x3a2a1a));
            v.position.set(-0.7 + i * 0.3, 0.7, 0.5);
            g.add(v); }
        } else if (type === 'network_core') {
          g.add((b => { b.position.y = 0.3; return b })(new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.6, 1.6), mat(
          col))));
          for (let i = 0; i < 8; i++) { const p = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.07, 0.04), mat(
              0x1a0033));
            p.position.set(-0.6 + i * 0.17, 0.35, 0.82);
            g.add(p); }
          const s = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 8), mat(0x00ccff, 0x00ccff));
          s.position.set(0.65, 0.55, 0.82);
          g.add(s);
        } else if (type === 'pdu') {
          g.add((b => { b.position.y = 0.9; return b })(new THREE.Mesh(new THREE.BoxGeometry(0.25, 1.8, 0.25),
            mat(col))));
          for (let i = 0; i < 6; i++) { const s = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.1, 0.06), mat(
              0x1a1a00));
            s.position.set(0, 0.3 + i * 0.25, 0.15);
            g.add(s); }
        } else if (type === 'fire_suppression') {
          g.add((b => { b.position.y = 0.55; return b })(new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 1.1,
            12), mat(col))));
          g.add((v => { v.position.y = 1.22; return v })(new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08,
            0.25, 8), mat(0x333333))));
          g.add((n => { n.position.y = 1.38; return n })(new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 8), mat(
            0x555555))));
        } else if (type === 'security_desk') {
          g.add((d => { d.position.y = 0.75; return d })(new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.08, 0.8),
            mat(col))));
          g.add((d => { d.position.set(-0.5, 0.75, 0.8); return d })(new THREE.Mesh(new THREE.BoxGeometry(0.8,
            0.08, 0.8), mat(col))));
          [
            [-0.8, 0],
            [0.8, 0]
          ].forEach(([lx, lz]) => { const l = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.75, 0.08), mat(
              0x445566));
            l.position.set(lx, 0.37, lz);
            g.add(l); });
          g.add((m => { m.position.set(0, 1.1, -0.1); return m })(new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.4,
            0.04), mat(0x112233))));
          g.add((s => { s.position.set(0, 1.1, -0.08); return s })(new THREE.Mesh(new THREE.BoxGeometry(0.54,
            0.34, 0.01), mat(0x003366, 0x004499))));
        }
        g.position.set(x, 0, z);
        return g;
      }

      const wrap = document.getElementById('dc3d-wrap');
      const canvas = document.getElementById('dc3d-canvas');
      if (!wrap || !canvas) return;
      const W = () => canvas.clientWidth,
        H = () => canvas.clientHeight;
      const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
      renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
      renderer.setSize(W(), H(), false);
      renderer.shadowMap.enabled = true;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 0.85;
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x0d1117);
      scene.fog = new THREE.Fog(0x0d1117, 28, 55);
      const camera = new THREE.PerspectiveCamera(45, W() / H(), 0.1, 200);
      camera.position.set(14, 12, 18);
      camera.lookAt(0, 0, 0);
      scene.add(new THREE.AmbientLight(0xffffff, 0.4));
      const sun = new THREE.DirectionalLight(0xffffff, 1);
      sun.position.set(10, 20, 10);
      sun.castShadow = true;
      sun.shadow.mapSize.set(2048, 2048);
      sun.shadow.camera.near = 0.1;
      sun.shadow.camera.far = 80;
      sun.shadow.camera.left = -20;
      sun.shadow.camera.right = 20;
      sun.shadow.camera.top = 20;
      sun.shadow.camera.bottom = -20;
      scene.add(sun);
      scene.add((f => { f.position.set(-8, 6, -8); return f })(new THREE.DirectionalLight(0x77C0F7, 0.35)));
      const floor = new THREE.Mesh(new THREE.PlaneGeometry(26, 26, 32, 32), new THREE.MeshStandardMaterial({ color: 0x111827,
        roughness: 0.9, metalness: 0.1 }));
      floor.rotation.x = -Math.PI / 2;
      floor.receiveShadow = true;
      scene.add(floor);
      scene.add(new THREE.GridHelper(26, 26, 0x1e3a5f, 0x1e3a5f));
      const tileGeo = new THREE.BoxGeometry(1.95, 0.06, 1.95),
        tileMat = new THREE.MeshStandardMaterial({ color: 0x162032, roughness: 0.8 });
      for (let x = -11; x <= 10; x += 2)
        for (let z = -9; z <= 9; z += 2) { const t = new THREE.Mesh(tileGeo, tileMat);
          t.position.set(x, 0.031, z);
          t.receiveShadow = true;
          scene.add(t); }
      const allObjects = [];
      LAYOUT.forEach(({ type, positions }) => positions.forEach(([x, z]) => {
        const group = buildComponent(type, x, z);
        group.traverse(child => { if (child.isMesh) { child.castShadow = true;
            child.receiveShadow = true;
            child.userData.componentGroup = group;
            allObjects.push(child); } });
        scene.add(group);
      }));
      const trayMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.7 });
      [
        [-3, -4],
        [-3, 2]
      ].forEach(([x, z]) => { const t = new THREE.Mesh(new THREE.BoxGeometry(8, 0.06, 0.18), trayMat);
        t.position.set(x, 2.8, z);
        scene.add(t); });
      const t2 = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.06, 9), trayMat);
      t2.position.set(1, 2.8, -1);
      scene.add(t2);

      // Orbit controls
      const ctrl = { target: new THREE.Vector3(0, 0, 0), spherical: new THREE.Spherical(), _pointers: {},
        _lastPinchDist: null, isDragging: false, isRightDrag: false, lastX: 0, lastY: 0 };
      ctrl.spherical.setFromVector3(camera.position.clone().sub(ctrl.target));

      function applyOrbit() {
        ctrl.spherical.phi = Math.max(0.15, Math.min(Math.PI / 2.1, ctrl.spherical.phi));
        ctrl.spherical.radius = Math.max(5, Math.min(50, ctrl.spherical.radius));
        camera.position.copy(new THREE.Vector3().setFromSpherical(ctrl.spherical).add(ctrl.target));
        camera.lookAt(ctrl.target);
      }
      canvas.addEventListener('contextmenu', e => e.preventDefault());
      canvas.addEventListener('mousedown', e => { ctrl.isDragging = true;
        ctrl.isRightDrag = e.button === 2;
        ctrl.lastX = e.clientX;
        ctrl.lastY = e.clientY;
        canvas.style.cursor = 'grabbing'; });
      window.addEventListener('mouseup', () => { ctrl.isDragging = false;
        canvas.style.cursor = 'grab'; });
      window.addEventListener('mousemove', e => {
        if (!ctrl.isDragging) return;
        const dx = e.clientX - ctrl.lastX,
          dy = e.clientY - ctrl.lastY;
        ctrl.lastX = e.clientX;
        ctrl.lastY = e.clientY;
        if (ctrl.isRightDrag) {
          const r = new THREE.Vector3();
          camera.getWorldDirection(r);
          r.cross(camera.up).normalize();
          ctrl.target.addScaledVector(r, -dx * 0.005 * ctrl.spherical.radius);
          ctrl.target.addScaledVector(camera.up, dy * 0.005 * ctrl.spherical.radius);
        } else { ctrl.spherical.theta -= dx * 0.008;
          ctrl.spherical.phi -= dy * 0.008; }
        applyOrbit();
      });
      canvas.addEventListener('wheel', e => { e.preventDefault();
        ctrl.spherical.radius *= (1 + e.deltaY * 0.001);
        applyOrbit(); }, { passive: false });
      canvas.addEventListener('touchstart', e => {
        e.preventDefault();
        [...e.changedTouches].forEach(t => { ctrl._pointers[t.identifier] = { x: t.clientX, y: t.clientY }; });
        const ids = Object.keys(ctrl._pointers);
        if (ids.length === 1) { ctrl.isDragging = true;
          ctrl.lastX = e.touches[0].clientX;
          ctrl.lastY = e.touches[0].clientY }
        if (ids.length === 2) { ctrl.isDragging = false;
          const p = Object.values(ctrl._pointers);
          ctrl._lastPinchDist = Math.hypot(p[0].x - p[1].x, p[0].y - p[1].y) }
      }, { passive: false });
      canvas.addEventListener('touchmove', e => {
        e.preventDefault();
        [...e.changedTouches].forEach(t => { ctrl._pointers[t.identifier] = { x: t.clientX, y: t.clientY }; });
        const ids = Object.keys(ctrl._pointers);
        if (ids.length === 1 && ctrl.isDragging) { const dx = e.touches[0].clientX - ctrl.lastX,
            dy = e.touches[0].clientY - ctrl.lastY;
          ctrl.lastX = e.touches[0].clientX;
          ctrl.lastY = e.touches[0].clientY;
          ctrl.spherical.theta -= dx * 0.01;
          ctrl.spherical.phi -= dy * 0.01;
          applyOrbit() }
        if (ids.length === 2) { const p = Object.values(ctrl._pointers),
            d = Math.hypot(p[0].x - p[1].x, p[0].y - p[1].y); if (ctrl._lastPinchDist) { ctrl.spherical
              .radius *= ctrl._lastPinchDist / d;
            applyOrbit() }
          ctrl._lastPinchDist = d }
      }, { passive: false });
      canvas.addEventListener('touchend', e => { [...e.changedTouches].forEach(t => delete ctrl._pointers[t
            .identifier]);
        ctrl._lastPinchDist = null;
        ctrl.isDragging = Object.keys(ctrl._pointers).length === 1; });

      // Raycaster + panel
      const raycaster = new THREE.Raycaster(),
        mouse = new THREE.Vector2();
      const panel = document.getElementById('dc3d-panel'),
        tooltip = document.getElementById('dc3d-tooltip');
      let highlighted = null,
        originalColors = new Map(),
        clickStartX = 0,
        clickStartY = 0;

      function highlight(group) { clearHighlight();
        highlighted = group;
        group.traverse(child => { if (child.isMesh) { originalColors.set(child, child.material.emissiveIntensity);
            child.material.emissiveIntensity = Math.min(child.material.emissiveIntensity + 0.45, 0.7) } }); }

      function clearHighlight() { if (!highlighted) return;
        highlighted.traverse(child => { if (child.isMesh && originalColors.has(child)) child.material
            .emissiveIntensity = originalColors.get(child) });
        originalColors.clear();
        highlighted = null; }

      function showPanel(def) {
        document.getElementById('dc3d-swatch').style.background = def.hex;
        document.getElementById('dc3d-label').textContent = 'Component';
        document.getElementById('dc3d-name').textContent = def.label;
        document.getElementById('dc3d-desc').textContent = def.desc;
        document.getElementById('dc3d-specs').innerHTML = def.specs.map(s =>
          `<div style="display:flex;justify-content:space-between;padding:.4rem 0;border-bottom:1px solid rgba(255,255,255,0.05);font-size:.78rem;"><span style="color:#64748b;">${s.k}</span><span style="color:#e2e8f0;font-weight:600;">${s.v}</span></div>`
        ).join('');
        panel.style.transform = 'translateX(0)';
        panel.style.pointerEvents = 'all';
      }
      document.getElementById('dc3d-close').addEventListener('click', () => { panel.style.transform = 'translateX(310px)';
        panel.style.pointerEvents = 'none';
        clearHighlight(); });
      canvas.addEventListener('mousedown', e => { clickStartX = e.clientX;
        clickStartY = e.clientY });
      canvas.addEventListener('mouseup', e => {
        if (Math.abs(e.clientX - clickStartX) > 5 || Math.abs(e.clientY - clickStartY) > 5) return;
        const r = canvas.getBoundingClientRect();
        mouse.x = ((e.clientX - r.left) / r.width) * 2 - 1;
        mouse.y = -((e.clientY - r.top) / r.height) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);
        const hits = raycaster.intersectObjects(allObjects);
        if (!hits.length) { panel.style.transform = 'translateX(310px)';
          panel.style.pointerEvents = 'none';
          clearHighlight(); return }
        const group = hits[0].object.userData.componentGroup;
        if (!group) return;
        highlight(group);
        showPanel(group.userData.componentDef);
      });
      canvas.addEventListener('mousemove', e => {
        const r = canvas.getBoundingClientRect();
        mouse.x = ((e.clientX - r.left) / r.width) * 2 - 1;
        mouse.y = -((e.clientY - r.top) / r.height) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);
        const hits = raycaster.intersectObjects(allObjects);
        if (hits.length && hits[0].object.userData.componentGroup) {
          tooltip.classList.add('show');
          tooltip.style.left = (e.clientX - wrap.getBoundingClientRect().left + 12) + 'px';
          tooltip.style.top = (e.clientY - wrap.getBoundingClientRect().top - 8) + 'px';
          tooltip.textContent = hits[0].object.userData.componentGroup.userData.componentDef.label;
          canvas.style.cursor = 'pointer';
        } else { tooltip.classList.remove('show');
          canvas.style.cursor = ctrl.isDragging ? 'grabbing' : 'grab'; }
      });

      const pillsContainer = document.getElementById('dc3d-pills');
      Object.entries(COMPONENTS).forEach(([key, def]) => {
        const pill = document.createElement('button');
        pill.type = 'button';
        pill.setAttribute('aria-label', 'Show ' + def.label + ' on the 3D model');
        pill.style.cssText =
          `background:${def.hex}1f;color:${def.hex};border:1.5px solid ${def.hex};padding:7px 14px;border-radius:20px;font-size:.75rem;font-weight:700;cursor:pointer;font-family:sans-serif;box-shadow:0 3px 8px -2px rgba(0,0,0,0.25),inset 0 1px 0 rgba(255,255,255,0.15);transition:transform .15s ease,background .15s ease,box-shadow .15s ease;`;
        pill.textContent = def.label;
        pill.addEventListener('mouseenter', () => { pill.style.transform = 'translateY(-2px)';
          pill.style.background = def.hex + '38';
          pill.style.boxShadow =
            `0 6px 14px -2px ${def.hex}66, inset 0 1px 0 rgba(255,255,255,0.2)`; });
        pill.addEventListener('mouseleave', () => { pill.style.transform = 'translateY(0)';
          pill.style.background = def.hex + '1f';
          pill.style.boxShadow =
            '0 3px 8px -2px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.15)'; });
        pill.addEventListener('click', () => { let found = false;
          scene.traverse(obj => { if (obj.isGroup && obj.userData.type === key && !found) { found = true;
              highlight(obj);
              showPanel(def) } }); });
        pillsContainer.appendChild(pill);
      });

      const clock = new THREE.Clock();
      let dc3dVisible = false;
      let dc3dRafId = null;

      function animate() {
        dc3dRafId = requestAnimationFrame(animate);
        const t = clock.getElapsedTime();
        scene.traverse(obj => { if (obj.isMesh && obj.material && obj.material.emissive) { const c = obj.material
              .emissive; if (c.r === 0 && c.g > 0.5 && c.b < 0.1) obj.material.emissiveIntensity = 0.12 + Math
                .sin(t * 3 + obj.id) * 0.06 } });
        renderer.render(scene, camera);
        const loader = document.getElementById('dc3d-loading');
        if (loader) loader.style.display = 'none';
      }
      const dc3dObs = new IntersectionObserver(entries => {
        dc3dVisible = entries[0].isIntersecting;
        if (dc3dVisible && !dc3dRafId) animate();
        if (!dc3dVisible && dc3dRafId) { cancelAnimationFrame(dc3dRafId);
          dc3dRafId = null; }
      }, { threshold: 0 });
      dc3dObs.observe(canvas);
      window.addEventListener('resize', () => { renderer.setSize(W(), H(), false);
        camera.aspect = W() / H();
        camera.updateProjectionMatrix() });

      const fsBtn = document.getElementById('dc3d-fullscreen');
      if (fsBtn) {
        const wrapEl = document.getElementById('dc3d-wrap');
        const fsLabel = document.getElementById('dc3d-fullscreen-label');
        const iconExpand = document.getElementById('dc3d-fs-icon-expand');
        const iconCollapse = document.getElementById('dc3d-fs-icon-collapse');
        let manualFs = false;

        const nativeFsEl = () => document.fullscreenElement || document.webkitFullscreenElement || null;
        const resizeRenderer = () => { renderer.setSize(W(), H(), false);
          camera.aspect = W() / H();
          camera.updateProjectionMatrix(); };

        function setBtnState(isFs) {
          fsBtn.setAttribute('aria-label', isFs ? 'Exit fullscreen' : 'View 3D model fullscreen');
          fsBtn.title = isFs ? 'Exit fullscreen' : 'View fullscreen';
          if (fsLabel) fsLabel.textContent = isFs ? 'Exit' : 'Fullscreen';
          if (iconExpand) iconExpand.style.display = isFs ? 'none' : '';
          if (iconCollapse) iconCollapse.style.display = isFs ? '' : 'none';
        }

        function enterManualFs() {
          manualFs = true;
          wrapEl.classList.add('dc3d-fullscreen-mode');
          document.body.classList.add('dc3d-fs-lock');
          setBtnState(true);
          requestAnimationFrame(resizeRenderer);
        }
        function exitManualFs() {
          manualFs = false;
          wrapEl.classList.remove('dc3d-fullscreen-mode');
          document.body.classList.remove('dc3d-fs-lock');
          setBtnState(false);
          requestAnimationFrame(resizeRenderer);
        }

        fsBtn.addEventListener('click', () => {
          if (manualFs) return exitManualFs();
          if (nativeFsEl()) return (document.exitFullscreen || document.webkitExitFullscreen).call(document);

          const request = wrapEl.requestFullscreen || wrapEl.webkitRequestFullscreen;
          if (!request) return enterManualFs(); // Fullscreen API unsupported here

          Promise.resolve(request.call(wrapEl))
            .then(() => setTimeout(resizeRenderer, 100))
            .catch(() => enterManualFs()); // e.g. blocked inside a sandboxed iframe/preview
        });

        document.addEventListener('fullscreenchange', () => { if (!manualFs) { setBtnState(!!nativeFsEl());
            setTimeout(resizeRenderer, 100); } });
        document.addEventListener('webkitfullscreenchange', () => { if (!manualFs) { setBtnState(!!nativeFsEl());
            setTimeout(resizeRenderer, 100); } });
        window.addEventListener('keydown', e => { if (e.key === 'Escape' && manualFs) exitManualFs(); });
        window.addEventListener('resize', () => { if (manualFs) resizeRenderer(); });
      }
    })();
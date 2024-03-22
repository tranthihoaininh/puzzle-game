
function getJsonFromUrl() {
    for (var b = {}, a = location.search.substr(1).split("&"), c = 0; c < a.length; c++) {
        var e = a[c].indexOf("="),
            e = [a[c].substring(0, e), a[c].substring(e + 1)];
        b[e[0]] = decodeURIComponent(e[1])
    }
    return b
};
var Splash = function(b) {};

function enterIncorrectOrientation() {
    showDiv("wrongRotation");
    game.onPause.dispatch()
}

function leaveIncorrectOrientation() {
    hideDiv("wrongRotation");
    game.onResume.dispatch()
}

function checkOrientation() {
    var b = !0;
    isIOS ? document.documentElement.clientWidth > document.documentElement.clientHeight ? (enterIncorrectOrientation(), b = !1) : leaveIncorrectOrientation() : window.innerWidth > window.innerHeight ? (enterIncorrectOrientation(), b = !1) : leaveIncorrectOrientation();
    return b
}
Splash.prototype = {
    preload: function() {
        game.canvas.id = "gameCanvas";
        document.getElementById("gameCanvas").style.position = "fixed";
        game.device.desktop || window.addEventListener("resize", function() {
            checkOrientation()
        });
        window.addEventListener("resize", function() {
            onGameResize()
        });
        this.game.stage.backgroundColor = 0;
        game.scale.fullScreenScaleMode = Phaser.ScaleManager.SHOW_ALL;
        game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        game.scale.pageAlignHorizontally = !0;
        game.scale.pageAlignVertically = !0;
        game.scale.refresh();
        loadAllGamesData();
        tutorial = getProfileVar("tutorial");
        null === tutorial && (tutorial = !0);
        loadSplash(this.game);
        !game.device.desktop && game.device.chrome && game.device.touch && inIframe() && game.input.mouse.stop()
    },
    create: function() {
        this._create()
    },
    _create: function() {
        this.logo = this.add.sprite(this.game.world.centerX, this.world.centerY, "inlogic_logo");
        this.logo.anchor.set(.5);
        this.logo.alpha = 1;
        this.loadContinue();
        checkOrientation();
        this.startPreloadDelayed(2 * Phaser.Timer.SECOND)
    },
    loadContinue: function() {
        this.logo.inputEnabled = !0;
        this.logo.events.onInputDown.add(this.startPreload, this);
        this.startPreload()
    },
    startPreload: function() {
        game.device.desktop || 0 != checkOrientation() ? this.game.state.start("PreloadState") : this.startPreloadDelayed(Phaser.Timer.SECOND)
    },
    startPreloadDelayed: function(b) {
        this.game.time.events.add(b, this.startPreload, this)
    }
};

function onGameResize() {
    game.scale.fullScreenScaleMode = Phaser.ScaleManager.SHOW_ALL;
    game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    game.scale.pageAlignHorizontally = !0;
    game.scale.pageAlignVertically = !0;
    game.scale.refresh()
}

function inIframe() {
    try {
        return window.self !== window.top
    } catch (b) {
        return !0
    }
};
var Preloader = function(b) {},
    preloadState, loaderPosY;
Preloader.prototype = {
    preload: function() {
        sceneLogo = sceneLanguages = null;
        startTime = Date.now();
        this.game.stage.backgroundColor = 0;
        preloadState = this;
        var b = navigator.userLanguage || navigator.language,
            b = b.toLowerCase(); - 1 !== b.indexOf("ru") && (LANG = "ru"); - 1 !== b.indexOf("no") && (LANG = "no");

        loaderPosY =
            this.game.world.height / 5 * 4.5;
        imgSplash = this.game.add.sprite(game.width / 2, game.height / 2, "inlogic_logo");
        imgSplash.anchor.x = .5;
        imgSplash.anchor.y = .5;
        percentageText = this.game.add.text(this.game.world.centerX, this.game.height - 20, "0 %", {
            font: '35px "gameFont"',
            fill: "#FFC575"
        });
        percentageText.anchor.set(.5);
        this.game.load.onFileComplete.add(this.fileComplete, this);
        loadImages(this.game);
        SOUNDS_ENABLED && loadSounds(this.game)
    },
    fileComplete: function(b, a, c, e, d) {
        percentageText.text = b + " %";
        100 <= b && this._create()
    },
    _create: function() {
        game.add.tween(percentageText).to({
            alpha: 0
        }, 1.4 * ScenesTransitions.TRANSITION_LENGTH, "Linear", !0, 3 * ScenesTransitions.TRANSITION_LENGTH, -1, !0);
        var b = Date.now() - startTime;
        2E3 > b ? game.time.events.add(2E3 - b, function() {
            this.startGame()
        }, this) : this.startGame()
    },
    inputListener: function() {
        this.startGame()
    },
    startGame: function() {
        null == sceneLanguages && null == sceneLogo && (this.game.world.remove(imgSplash), ScenesTransitions.hideSceneAlpha(percentageText), null == gameState ? game.state.start("GameState") :
            (sceneLogo = new SceneLogo, sceneLogo.ShowAnimated()))
    }
};
var loadedProfile = "";

function loadAllGamesData() {
    var b = null;
    try {
        b = localStorage.getItem("jewelBlocks")
    } catch (a) {}
    null !== b ? (loadedProfile = b, loadedProfile = JSON.parse(b), bestScore = getProfileVar("bestScore"), tutorial = getProfileVar("tutorial")) : (bestScore = 0, tutorial = !0)
}

function saveAllGameData() {
    var b = {};
    b.bestScore = bestScore;
    b.tutorial = tutorial;
    b.msc = soundManager.musicPlaying;
    try {
        localStorage.setItem("jewelBlocks", JSON.stringify(b))
    } catch (a) {}
}

function getProfileVar(b) {
    return null == loadedProfile ? null : loadedProfile.hasOwnProperty(b) ? loadedProfile[b] : null
};
var GameState = function() {},
    gameState = null,
    particles = null;
GameState.prototype = {
    preload: function() {
        game.physics.startSystem(Phaser.Physics.ARCADE)
    },
    create: function() {
        game.stage.backgroundColor = 0;
        game.renderer.renderSession.roundPixels = !0;
        ScenesTransitions.TRANSITION_LENGTH *= .4;
        game.time.advancedTiming = !0;
        game.time.desiredFps = 30;
        gameState = this;
        soundManager = new SoundManager(game);
        soundManager.create();
        scenes = [];
        scenes.push(new SceneBackground);
        scenes.push(new SceneLogo);
        scenes.push(new SceneMenu);
        scenes.push(new ScenePause);
        scenes.push(new SceneGame);
        scenes.push(new SceneResult);
        this.game.stage.backgroundColor = 0;
        SceneBackground.instance.ShowAnimated();
        SceneLogo.instance.ShowAnimated();
        SceneMenu.instance.ShowAnimated(100);
        game.onPause.add(this.onGamePause, this);
        game.onResume.add(this.onGameResume, this);
        resizeCounter = 0
    },
    update: function() {},
    onGamePause: function() {
        game.device.desktop && game.device.chrome && game.input.mspointer.stop();
        scenes.forEach(function(b) {
            if ("function" === typeof b.onPause) b.onPause()
        });
        paused = !0;
        soundManager.pauseMusic()
    },
    onGameResume: function() {
        game.device.desktop &&
            game.device.chrome && game.input.mspointer.stop();
        paused = !1;
        soundManager.resumeMusic();
        scenes.forEach(function(b) {
            if ("function" === typeof b.onResume) b.onResume()
        })
    }
};
var ScenesTransitions = function() {};
ScenesTransitions.TRANSITION_LENGTH = 200;
ScenesTransitions.TRANSITION_EFFECT_IN = Phaser.Easing.Linear.In;
ScenesTransitions.TRANSITION_EFFECT_OUT = Phaser.Easing.Linear.Out;
ScenesTransitions.transitionActive = !1;
ScenesTransitions.transitionStarted = function() {
    ScenesTransitions.transitionActive = !0
};
ScenesTransitions.transitionFinished = function() {
    ScenesTransitions.transitionActive = !1
};
ScenesTransitions.showSceneAlpha = function(b, a, c, e, d) {
    void 0 === a && (a = 0);
    void 0 === c && (c = ScenesTransitions.TRANSITION_LENGTH / 2);
    void 0 === e && (e = null);
    void 0 === d && (d = 1);
    game.tweens.removeFrom(b, !1);
    b.visible = !0;
    b.alpha = 0;
    a = game.add.tween(b).to({
        alpha: d
    }, c, ScenesTransitions.TRANSITION_EFFECT_IN, !1, a);
    a.onComplete.add(ScenesTransitions.onSceneShown, {
        shownScene: b,
        callback: e
    });
    a.start();
    b.showTween = a
};
ScenesTransitions.hideSceneAlpha = function(b, a, c, e) {
    void 0 === a && (a = 0);
    void 0 === c && (c = ScenesTransitions.TRANSITION_LENGTH / 2);
    void 0 === e && (e = null);
    game.tweens.removeFrom(b, !0);
    var d = game.add.tween(b);
    d.to({
        alpha: 0
    }, c, ScenesTransitions.TRANSITION_EFFECT_OUT, !1, a);
    d.onComplete.add(ScenesTransitions.onSceneHidden, {
        hiddenScene: b,
        callback: e
    });
    d.start();
    return b.hideTween = d
};
ScenesTransitions.onSceneHidden = function() {
    this.hiddenScene.visible = !1;
    null != this.callback && this.callback()
};
ScenesTransitions.onSceneShown = function() {
    null != this.callback && this.callback()
};
ScenesTransitions.showSceneH = function(b, a, c, e, d) {
    void 0 === e && (e = ScenesTransitions.TRANSITION_LENGTH);
    void 0 === d && (d = null);
    game.tweens.removeFrom(b, !0);
    b.visible = !0;
    b.x = game.width * (a ? -2 : 2);
    b.y = 0;
    showTween = game.add.tween(b).to({
        x: 0
    }, e, ScenesTransitions.TRANSITION_EFFECT_IN, !1);
    showTween.onComplete.add(ScenesTransitions.onSceneShown, {
        shownScene: b,
        callback: d
    });
    showTween.start();
    b.showTween = showTween
};
ScenesTransitions.hideSceneV = function(b, a, c, e, d) {
    void 0 === d && (d = null);
    game.tweens.removeFrom(b, !0);
    c = game.add.tween(b);
    c.to({
        y: game.height * (a ? -2 : 2)
    }, ScenesTransitions.TRANSITION_LENGTH, ScenesTransitions.TRANSITION_EFFECT_OUT);
    c.onComplete.add(ScenesTransitions.onSceneHidden, {
        hiddenScene: b,
        callback: d
    });
    c.start();
    return b.hideTween = c
};
ScenesTransitions.showSceneV = function(b, a, c, e, d) {
    void 0 === c && (c = 0);
    void 0 === e && (e = ScenesTransitions.TRANSITION_LENGTH);
    void 0 === d && (d = null);
    game.tweens.removeFrom(b, !0);
    b.visible = !0;
    b.x = 0;
    b.y = game.height * (a ? -2 : 2);
    showTween = game.add.tween(b).to({
        y: 0
    }, e, ScenesTransitions.TRANSITION_EFFECT_IN, !1, c);
    showTween.onComplete.add(ScenesTransitions.onSceneShown, {
        shownScene: b,
        callback: d
    });
    showTween.start();
    b.showTween = showTween
};
ScenesTransitions.hideSceneToBottom = function(b, a, c, e) {
    void 0 === a && (a = 0);
    void 0 === c && (c = ScenesTransitions.TRANSITION_LENGTH);
    void 0 === e && (e = null);
    return ScenesTransitions.hideSceneV(b, !1, a, c, e)
};
ScenesTransitions.showSceneFromBottom = function(b, a, c, e) {
    void 0 === a && (a = 0);
    void 0 === c && (c = ScenesTransitions.TRANSITION_LENGTH);
    void 0 === e && (e = null);
    return ScenesTransitions.showSceneV(b, !1, a, c, e)
};
ScenesTransitions.showSceneFromLeft = function(b, a, c, e) {
    void 0 === a && (a = 0);
    void 0 === c && (c = ScenesTransitions.TRANSITION_LENGTH);
    void 0 === e && (e = null);
    return ScenesTransitions.showSceneH(b, !0, a, c, e)
};
ScenesTransitions.showSceneFromRight = function(b, a, c, e) {
    void 0 === a && (a = 0);
    void 0 === c && (c = ScenesTransitions.TRANSITION_LENGTH);
    void 0 === e && (e = null);
    return ScenesTransitions.showSceneH(b, !1, a, c, e)
};
ScenesTransitions.showSceneScale = function(b, a, c, e, d, f) {
    void 0 === a && (a = 0);
    void 0 === c && (c = ScenesTransitions.TRANSITION_LENGTH / 2);
    void 0 === e && (e = null);
    void 0 === d && (d = ScenesTransitions.TRANSITION_EFFECT_IN);
    void 0 === f && (f = 1);
    b.scale.set(0);
    b.visible = !0;
    a = game.add.tween(b.scale).to({
        x: f,
        y: f
    }, c, d, !1, a);
    a.onComplete.add(ScenesTransitions.onSceneShown, {
        shownScene: b,
        callback: e
    });
    a.start();
    b.showTween = a
};
ScenesTransitions.hideSceneScale = function(b, a, c, e, d) {
    void 0 === a && (a = 0);
    void 0 === c && (c = ScenesTransitions.TRANSITION_LENGTH / 2);
    void 0 === e && (e = null);
    void 0 === d && (d = ScenesTransitions.TRANSITION_EFFECT_IN);
    b.visible = !0;
    a = game.add.tween(b.scale).to({
        x: 0,
        y: 0
    }, c, d, !1, a);
    a.onComplete.add(ScenesTransitions.onSceneHidden, {
        hiddenScene: b,
        callback: e
    });
    a.start();
    b.hideTween = showTween
};
var ScenePause = function() {
    ScenePause.instance = this;
    this.create()
};
ScenePause.instance = null;
ScenePause.prototype = {
    create: function() {
        grpScenePause = game.add.group();
        grpScenePause.name = "grpScenePause";
        this.createBackgroundTable(300, 400, "pauseTable");
        imgPauseLogo = game.add.sprite(game.width >> 1, game.height >> 1, game.cache.getBitmapData("pauseTable"));
        imgPauseLogo.anchor.set(.5);
        grpScenePause.add(imgPauseLogo);
        var b = grpScenePause.create((game.width >> 1) - 210, (game.height >> 1) - 210, "ribbon");
        b.anchor.x = 0;
        b.anchor.y = .5;
        grpScenePause.add(b);
        pauseText = "ru" == LANG ? game.make.text(game.width >> 1, game.height >>
            1, "\u041f\u0410\u0423\u0417\u0410", {
                font: '35px "gameFont"',
                fill: "#FFC575"
            }) : game.make.text(game.width >> 1, game.height >> 1, "PAUSE", {
            font: '35px "gameFont"',
            fill: "#FFC575"
        });
        pauseText.x = (game.width >> 1) - pauseText.width / 2;
        pauseText.y = (game.height >> 1) / 2 - pauseText.height / 3 - 25;
        grpScenePause.add(pauseText);
        this.createLongBtnImg("longMenuBtn", 1, "icons", 6, "playBtnLong");
        btnPauseResume = SOUNDS_ENABLED ? game.add.sprite(game.width >> 1, (game.height >> 1) - 100, game.cache.getBitmapData("playBtnLong")) : game.add.sprite(game.width >>
            1, (game.height >> 1) - 50, game.cache.getBitmapData("playBtnLong"));
        btnPauseResume.anchor.set(.5);
        grpScenePause.add(btnPauseResume);
        AddButtonEvents(btnPauseResume, ScenePause.instance.OnPressedResume, ButtonOnInputOver, ButtonOnInputOut);
        this.createLongBtnImg("longMenuBtn", 1, "icons", 2, "longBtnSoundOn");
        this.createLongBtnImg("longMenuBtn", 0, "icons", 3, "longBtnSoundOff");
        SOUNDS_ENABLED && (b = soundManager.musicPlaying ? grpScenePause.create(game.width >> 1, game.height >> 1, game.cache.getBitmapData("longBtnSoundOn")) :
            grpScenePause.create(game.width >> 1, game.height >> 1, game.cache.getBitmapData("longBtnSoundOff")), b.anchor.set(.5), AddButtonEvents(b, this.OnPressedSound, ButtonOnInputOver, ButtonOnInputOut));
        this.createLongBtnImg("longMenuBtn", 1, "icons", 1, "exitBtn");
        btnPauseQuit = SOUNDS_ENABLED ? game.add.sprite(game.width >> 1, (game.height >> 1) + 100, game.cache.getBitmapData("exitBtn")) : game.add.sprite(game.width >> 1, (game.height >> 1) + 50, game.cache.getBitmapData("exitBtn"));
        btnPauseQuit.anchor.set(.5);
        grpScenePause.add(btnPauseQuit);
        AddButtonEvents(btnPauseQuit, this.OnPressedPauseToMainMenu, ButtonOnInputOver, ButtonOnInputOut);
        grpScenePause.visible = !1
    },
    OnPressedResume: function() {
        soundManager.playSound("tile_select");
        ScenePause.instance.HideAnimated();
        SceneLogo.instance.HideAnimated();
        SceneGame.instance.ShowAnimated();
        SceneGame.instance.ResumeGame()
    },
    OnPressedSound: function() {
        soundManager.playSound("tile_select");
        soundManager.musicPlaying ? grpScenePause.children[4].loadTexture(game.cache.getBitmapData("longBtnSoundOff")) : grpScenePause.children[4].loadTexture(game.cache.getBitmapData("longBtnSoundOn"));
        soundManager.toggleMusic("music_menu")
    },
    OnPressedPauseToMainMenu: function() {
        soundManager.playSound("tile_select");
        ScenePause.instance.HideAnimated();
        SceneGame.instance.HideAnimated();
        SceneLogo.instance.ShowAnimated();
        SceneMenu.instance.ShowAnimated();
        SceneGame.instance.onGameOver(GAME_OVER_BY_USER)
    },
    ShowAnimated: function() {
        soundManager.playSound("tile_select");
        SOUNDS_ENABLED && (soundManager.musicPlaying ? grpScenePause.children[4].loadTexture(game.cache.getBitmapData("longBtnSoundOn")) : grpScenePause.children[4].loadTexture(game.cache.getBitmapData("longBtnSoundOff")));
        ScenesTransitions.transitionStarted();
        ScenesTransitions.TRANSITION_EFFECT_IN = Phaser.Easing.Back.Out;
        ScenesTransitions.showSceneFromBottom(grpScenePause, 0, ScenesTransitions.TRANSITION_LENGTH, ScenesTransitions.transitionFinished);
        ScenesTransitions.TRANSITION_EFFECT_IN = Phaser.Easing.Linear.In
    },
    HideAnimated: function() {
        ScenesTransitions.transitionStarted();
        ScenesTransitions.TRANSITION_EFFECT_OUT = Phaser.Easing.Linear.Out;
        ScenesTransitions.hideSceneToBottom(grpScenePause, 0, ScenesTransitions.TRANSITION_LENGTH,
            ScenesTransitions.transitionFinished);
        ScenesTransitions.TRANSITION_EFFECT_OUT = Phaser.Easing.Linear.Out
    },
    createBackgroundTable: function(b, a, c) {
        b = Math.floor(b / 16);
        a = Math.floor(a / 16);
        var e = game.add.bitmapData(16 * b, 16 * a);
        e.draw(game.make.image(0, 0, "dialogImg", 0), 0, 0);
        e.draw(game.make.image(0, 0, "dialogImg", 2), 16 * (b - 1), 0);
        e.draw(game.make.image(0, 0, "dialogImg", 6), 0, 16 * (a - 1));
        e.draw(game.make.image(0, 0, "dialogImg", 8), 16 * (b - 1), 16 * (a - 1));
        for (var d = 1; d < b - 1; d++) e.draw(game.make.image(0, 0, "dialogImg", 1), 16 * d,
            0), e.draw(game.make.image(0, 0, "dialogImg", 7), 16 * d, 16 * (a - 1));
        for (d = 1; d < a - 1; d++) e.draw(game.make.image(0, 0, "dialogImg", 3), 0, 16 * d), e.draw(game.make.image(0, 0, "dialogImg", 5), 16 * (b - 1), 16 * d);
        for (d = 1; d < a - 1; d++)
            for (var f = 1; f < b - 1; f++) e.draw(game.make.image(0, 0, "dialogImg", 4), 16 * f, 16 * d);
        if (null != c) game.cache.addBitmapData(c, e);
        else return e
    },
    createLongBtnImg: function(b, a, c, e, d) {
        var f = game.add.bitmapData(250, 55);
        f.draw(game.make.image(0, 0, b, a), 0, 0);
        f.draw(game.make.image(0, 0, c, e), 105, 7.5);
        if (null != d) game.cache.addBitmapData(d,
            f);
        else return f
    }
};
var SceneBackground = function() {
    SceneBackground.instance = this;
    this.create()
};
SceneBackground.instance = null;
SceneBackground.prototype = {
    create: function() {
        grpSceneBackgroundCenter = game.add.group();
        grpSceneBackgroundCenter.name = "BackgroundCenter";
        grpSceneBackgroundLeft = game.add.group();
        grpSceneBackgroundLeft.name = "BackgroundLeft";
        grpSceneBackgroundRight = game.add.group();
        grpSceneBackgroundRight.name = "BackgroundRight";
        imgGameBGright = grpSceneBackgroundRight.create(game.width, game.height, "leafs");
        imgGameBGright.width = game.width;
        imgGameBGright.scale.y = imgGameBGright.scale.x;
        imgGameBGright.anchor.setTo(1, 1);
        grpSceneBackgroundCenter.visible = !1;
        grpSceneBackgroundLeft.visible = !1;
        grpSceneBackgroundRight.visible = !1
    },
    onResolutionChange: function() {
        GAME_CURRENT_ORIENTATION == ORIENTATION_PORTRAIT ? (imgGameBG.height = game.height, imgGameBG.scale.x = imgGameBG.scale.y, imgGameBG.width < game.height && (imgGameBG.width = game.height)) : (imgGameBG.width = game.width, imgGameBG.scale.y = imgGameBG.scale.x);
        imgGameBG.x = game.width >> 1;
        imgGameBGleft.x = 0;
        imgGameBGleft.height = game.height;
        imgGameBGright.height = game.height;
        imgGameBGright.x = game.width
    },
    update: function() {},
    ShowAnimated: function() {
        ScenesTransitions.transitionStarted();
        gameRunning = !1;
        var b = 4 * ScenesTransitions.TRANSITION_LENGTH;
        ScenesTransitions.showSceneAlpha(grpSceneBackgroundCenter, 0, b);
        ScenesTransitions.TRANSITION_EFFECT_IN = Phaser.Easing.Sinusoidal.Out;
        ScenesTransitions.showSceneFromLeft(grpSceneBackgroundLeft, 0, b);
        ScenesTransitions.showSceneFromRight(grpSceneBackgroundRight, 0, b, ScenesTransitions.transitionFinished);
        ScenesTransitions.TRANSITION_EFFECT_IN = Phaser.Easing.Linear.In
    }
};
var scoreTxt, scoreText, bestScoreTxt, bestScoreText, bestText, cup, bestCup, btnResultPlay, emitter, SceneResult = function() {
    SceneResult.instance = this;
    this.create()
};
SceneResult.instance = null;
SceneResult.prototype = {
    create: function() {
        grpSceneResult = game.add.group();
        grpSceneResult.name = "SceneResult";
        this.createBackgroundTable(300, 300, "ResultTable");
        var b = game.make.sprite(game.width >> 1, (game.height >> 1) - 130, game.cache.getBitmapData("ResultTable"));
        b.anchor.set(.5);
        grpSceneResult.add(b);
        b = grpSceneResult.create((game.width >> 1) - 210, (game.height >> 1) - 210, "ribbon");
        b.anchor.x = 0;
        b.anchor.y = .5;
        grpSceneResult.add(b);
        b = "ru" == LANG ? game.make.text(game.width >> 1, game.height >> 1, "\u0425\u043e\u0434\u043e\u0432 \u0431\u043e\u043b\u044c\u0448\u0435 \u043d\u0435\u0442!", {
            font: '35px "gameFont"',
            fill: "#FFC575"
        }) : "no" == LANG ? game.make.text(game.width >> 1, game.height >> 1, "Ikke flere trekk!", {
            font: '35px "gameFont"',
            fill: "#FFC575"
        }) : game.make.text(game.width >> 1, game.height >> 1, "No more moves!", {
            font: '35px "gameFont"',
            fill: "#FFC575"
        });
        b.x = (game.width >> 1) - b.width / 2;
        b.y = (game.height >> 1) / 2 - b.height / 3 - 30;
        grpSceneResult.add(b);
        scoreText = "ru" == LANG ? game.make.text(game.width >> 1, game.height >> 1, "\u0421\u0427\u0415\u0422", {
            font: '20px "gameFont"',
            fill: "#FFC575"
        }) : "no" == LANG ? game.make.text(game.width >>
            1, game.height >> 1, "POENG", {
                font: '20px "gameFont"',
                fill: "#FFC575"
            }) : game.make.text(game.width >> 1, game.height >> 1, "SCORE", {
            font: '20px "gameFont"',
            fill: "#FFC575"
        });
        scoreText.setShadow(2, 2, "rgba(0,0,0,0.5)", 0);
        scoreText.fontWeight = "bold";
        scoreText.x = (game.width >> 1) - scoreText.width / 2;
        scoreText.y = (game.height >> 1) / 2 - scoreText.height / 3 + 30;
        grpSceneResult.add(scoreText);
        scoreTxt = game.make.text(game.width >> 1, game.height >> 1, score, {
            font: '40px "gameFont"',
            fill: "#FFC575"
        });
        scoreTxt.x = (game.width >> 1) - scoreTxt.width /
            2;
        scoreTxt.y = (game.height >> 1) / 2 - scoreTxt.height / 3 + 60;
        grpSceneResult.add(scoreTxt);
        bestText = "ru" == LANG ? game.make.text(game.width >> 1, game.height >> 1, "\u041b\u0423\u0427\u0428\u0418\u0419", {
            font: '20px "gameFont"',
            fill: "#FFC575"
        }) : "no" == LANG ? game.make.text(game.width >> 1, game.height >> 1, "BESTE", {
            font: '20px "gameFont"',
            fill: "#FFC575"
        }) : game.make.text(game.width >> 1, game.height >> 1, "BEST", {
            font: '20px "gameFont"',
            fill: "#FFC575"
        });
        bestText.setShadow(2, 2, "rgba(0,0,0,0.5)", 0);
        bestText.fontWeight = "bold";
        bestText.x =
            (game.width >> 1) - bestText.width / 2;
        bestText.y = (game.height >> 1) / 2 - bestText.height / 3 + 130;
        grpSceneResult.add(bestText);
        bestScoreTxt = game.make.text(game.width >> 1, game.height >> 1, bestScore, {
            font: '30px "gameFont"',
            fill: "#FFC575"
        });
        bestScoreTxt.x = (game.width >> 1) - bestScoreTxt.width / 2;
        bestScoreTxt.y = (game.height >> 1) / 2 - bestScoreTxt.height / 3 + 160;
        grpSceneResult.add(bestScoreTxt);
        cup = game.add.sprite((game.width >> 1) - 100, (game.height >> 1) - 145, "cup");
        cup.anchor.x = 0;
        cup.anchor.y = .5;
        cup.visible = !1;
        cup.alpha = 0;
        grpSceneResult.add(cup);
        bestCup = game.add.sprite((game.width >> 1) - 100, (game.height >> 1) - 50, "cup");
        bestCup.scale.set(.9);
        bestCup.anchor.x = 0;
        bestCup.anchor.y = .5;
        bestCup.visible = !0;
        grpSceneResult.add(bestCup);
        btnResultPlay = game.add.sprite(game.width >> 1, (game.height >> 1) + 100, "playBtn", 0);
        btnResultPlay.animations.add("blink");
        btnResultPlay.animations.play("blink", 1, !0);
        btnResultPlay.anchor.set(.5);
        btnResultPlay.scale.set(1);
        btnResultPlay.inputEnabled = !1;
        grpSceneResult.add(btnResultPlay);
        AddButtonEvents(btnResultPlay, this.OnPlay,
            ButtonOnInputOver, ButtonOnInputOut);
        game.add.tween(btnResultPlay).to({
            alpha: 1
        }, 2E8, Phaser.Easing.Linear.None, !0, 0, 1E3, !0);
        SOUNDS_ENABLED && (this.createBtnImg("menuBtn", 0, "icons", 2, "soundOnBtn"), this.createBtnImg("menuBtn", 0, "icons", 3, "soundOffBtn"), btnSound = soundManager.musicPlaying ? game.add.sprite(game.width >> 1, (game.height >> 1) + 220, game.cache.getBitmapData("soundOnBtn")) : game.add.sprite(game.width >> 1, (game.height >> 1) + 220, game.cache.getBitmapData("soundOffBtn")), btnSound.anchor.set(.5), grpSceneResult.add(btnSound),
            AddButtonEvents(btnSound, this.OnPressedToogleMusic, ButtonOnInputOver, ButtonOnInputOut));
        grpSceneResult.visible = !1
    },
    update: function() {},
    updateScore: function() {
        if (null === bestScore || 0 === bestScore) bestScoreTxt.text = score, saveAllGameData(), bestScoreTxt.x = (game.width >> 1) - bestScoreTxt.width / 2, scoreTxt.text = score, scoreTxt.x = (game.width >> 1) - scoreTxt.width / 2;
        else {
            if (bestScore < score || null === bestScore) saveAllGameData(), cup.visible = !0, game.camera.shake(.005, 500);
            bestScoreTxt.text = "" + bestScore;
            scoreTxt.text = score;
            scoreTxt.x = (game.width >> 1) - scoreTxt.width / 2;
            bestScoreTxt.x = (game.width >> 1) - bestScoreTxt.width / 2
        }
    },
    _OnPlay: function() {
        soundManager.playSound("tile_select");
        SceneResult.instance.HideAnimated();
        SceneGame.instance.create();
        SceneGame.instance.onGameStart();
        SceneGame.instance.OnRestart();
        SceneGame.instance.ShowAnimated()
    },
    OnPlay: function() {
        game.paused = !1;
        SceneResult.instance._OnPlay();
    },
    OnPressedToogleMusic: function() {
        soundManager.playSound("tile_select");
        soundManager.musicPlaying ? btnSound.loadTexture(game.cache.getBitmapData("soundOffBtn")) : btnSound.loadTexture(game.cache.getBitmapData("soundOnBtn"));
        soundManager.toggleMusic("music_menu")
    },
    ShowAnimated: function() {
        ScenesTransitions.transitionStarted();
        ScenesTransitions.TRANSITION_EFFECT_IN = Phaser.Easing.Linear.In;
        ScenesTransitions.showSceneAlpha(grpSceneResult, 50, ScenesTransitions.TRANSITION_LENGTH);
        SOUNDS_ENABLED && (soundManager.musicPlaying ? btnSound.loadTexture(game.cache.getBitmapData("soundOnBtn")) :
            btnSound.loadTexture(game.cache.getBitmapData("soundOffBtn")));
        bestScoreTxt.alpha = 0;
        scoreTxt.alpha = 0;
        scoreText.alpha = 0;
        bestText.alpha = 0;
        cup.alpha = 0;
        bestCup.alpha = 0;
        cup.scale.setTo(3);
        cup.visible = !1;
        scoreTxt.text = score;
        btnResultPlay.inputEnabled = !1;
        scoreTxt.x = (game.width >> 1) - scoreTxt.width / 2;
        var b = 650,
            a;
        a = bestScore <= score || null === bestScore || 0 == bestScore ? [bestScoreTxt, bestText, scoreTxt, scoreText, cup] : [bestScoreTxt, bestCup, bestText, scoreTxt, scoreText, cup];
        for (var c = 0; c < a.length; c++) {
            var b = b + 198,
                e = game.add.tween(a[c]).to({
                        alpha: 1
                    },
                    220, "Linear", !0, b),
                d;
            c === a.length - 1 ? bestScore <= score || null === bestScore || 0 == bestScore ? (bestScore = score, bestScoreTxt.text = bestScore, bestScoreTxt.x = (game.width >> 1) - bestScoreTxt.width / 2, saveAllGameData(), e = game.add.tween(a[c]).to({
                    alpha: 1
                }, 220, "Linear", !0, b), d = game.add.tween(a[c].scale).to({
                    x: 1,
                    y: 1
                }, 220, "Linear", !0, b), d.onComplete.add(this.inputEnabled, this), cup.visible = !0, e.onComplete.add(ScenesTransitions.transitionFinished), d.onComplete.add(this.complete, this), SceneGame.instance.onGameOver(GAME_OVER_WIN)) :
                (SceneGame.instance.onGameOver(GAME_OVER_LOSE), saveAllGameData(), cup.alpha = 0, cup.visible = !1, e.onComplete.add(this.inputEnabled, this)) : (e.onComplete.add(ScenesTransitions.transitionFinished), c === a.length - 1 && e.onComplete.add(this.inputEnabled, this))
        }
    },
    inputEnabled: function() {
        btnResultPlay.inputEnabled = !0
    },
    complete: function() {
        ScenesTransitions.transitionFinished;
        game.camera.shake(.005, 350)
    },
    HideAnimated: function() {
        ScenesTransitions.transitionStarted();
        ScenesTransitions.TRANSITION_EFFECT_OUT = Phaser.Easing.Linear.Out;
        ScenesTransitions.hideSceneAlpha(grpSceneResult, .5 * ScenesTransitions.TRANSITION_LENGTH, ScenesTransitions.TRANSITION_LENGTH + 10, ScenesTransitions.transitionFinished)
    },
    destroyEmitter: function() {
        emitter.destroy()
    },
    GetRenderTypeName: function(b) {
        switch (b) {
            case Phaser.AUTO:
                return "AUTO";
            case Phaser.CANVAS:
                return "CANVAS";
            case Phaser.WEBGL:
                return "WEBGL"
        }
        return "NaN"
    },
    createBackgroundTable: function(b, a, c) {
        b = Math.floor(b / 16);
        a = Math.floor(a / 16);
        var e = game.add.bitmapData(16 * b, 16 * a);
        e.draw(game.make.image(0, 0, "dialogImg",
            0), 0, 0);
        e.draw(game.make.image(0, 0, "dialogImg", 2), 16 * (b - 1), 0);
        e.draw(game.make.image(0, 0, "dialogImg", 6), 0, 16 * (a - 1));
        e.draw(game.make.image(0, 0, "dialogImg", 8), 16 * (b - 1), 16 * (a - 1));
        for (var d = 1; d < b - 1; d++) e.draw(game.make.image(0, 0, "dialogImg", 1), 16 * d, 0), e.draw(game.make.image(0, 0, "dialogImg", 7), 16 * d, 16 * (a - 1));
        for (d = 1; d < a - 1; d++) e.draw(game.make.image(0, 0, "dialogImg", 3), 0, 16 * d), e.draw(game.make.image(0, 0, "dialogImg", 5), 16 * (b - 1), 16 * d);
        for (d = 1; d < a - 1; d++)
            for (var f = 1; f < b - 1; f++) e.draw(game.make.image(0, 0, "dialogImg",
                4), 16 * f, 16 * d);
        if (null != c) game.cache.addBitmapData(c, e);
        else return e
    },
    createBtnImg: function(b, a, c, e, d) {
        var f = game.add.bitmapData(90, 55);
        f.draw(game.make.image(0, 0, b, a), 0, 0);
        f.draw(game.make.image(0, 0, c, e), 25, 8);
        void 0 == e && f.draw(game.make.image(0, 0, c), 25, 8);
        if (null != d) game.cache.addBitmapData(d, f);
        else return f
    }
};
var SceneMenu = function() {
    SceneMenu.instance = this;
    this.create()
};
SceneMenu.instance = null;
SceneMenu.prototype = {
    create: function() {
        soundManager.playMusic("music_menu");
        grpSceneMenu = game.add.group();
        grpSceneMenu.name = "grpSceneMenu";
        btnMenuPlay = game.add.sprite(game.width >> 1, (game.height >> 1) + 100, "playBtn", 0);
        btnMenuPlay.animations.add("blink");
        btnMenuPlay.animations.play("blink", 1, !0);
        btnMenuPlay.anchor.set(.5);
        btnMenuPlay.scale.set(1);
        grpSceneMenu.add(btnMenuPlay);
        AddButtonEvents(btnMenuPlay, SceneMenu.instance.OnPressedPlay, ButtonOnInputOver, ButtonOnInputOut);
        game.add.tween(btnMenuPlay).to({
                alpha: 1
            },
            2E8, Phaser.Easing.Linear.None, !0, 0, 1E3, !0);
        SOUNDS_ENABLED && (this.createBtnImg("menuBtn", 0, "icons", 2, "soundOnBtn"), this.createBtnImg("menuBtn", 0, "icons", 3, "soundOffBtn"), btnMenuSound = soundManager.musicPlaying ? game.add.sprite(game.width >> 1, (game.height >> 1) + 220, game.cache.getBitmapData("soundOnBtn")) : game.add.sprite(game.width >> 1, (game.height >> 1) + 220, game.cache.getBitmapData("soundOffBtn")), btnMenuSound.anchor.set(.5), grpSceneMenu.add(btnMenuSound), AddButtonEvents(btnMenuSound, this.OnPressedToogleMusic,
            ButtonOnInputOver, ButtonOnInputOut));
        grpSceneMenu.visible = !1
    },
    _OnPressedPlay: function() {
        soundManager.playSound("tile_select");
        SceneMenu.instance.HideAnimated();
        SceneGame.instance.create();
        SceneGame.instance.onGameStart();
        SceneGame.instance.ShowAnimated()
    },
    OnPressedPlay: function() {
		gradle.event('btn_play');
        game.paused = !1;
        SceneMenu.instance._OnPressedPlay();
    },
    OnPressedToogleMusic: function() {
        soundManager.playSound("tile_select");
        soundManager.musicPlaying ?
            btnMenuSound.loadTexture(game.cache.getBitmapData("soundOffBtn")) : btnMenuSound.loadTexture(game.cache.getBitmapData("soundOnBtn"));
        soundManager.toggleMusic("music_menu")
    },
    createBtnImg: function(b, a, c, e, d) {
        var f = game.add.bitmapData(90, 55);
        f.draw(game.make.image(0, 0, b, a), 0, 0);
        f.draw(game.make.image(0, 0, c, e), 25, 8);
        void 0 == e && f.draw(game.make.image(0, 0, c), 25, 8);
        if (null != d) game.cache.addBitmapData(d, f);
        else return f
    },
    ShowAnimated: function(b) {
        void 0 === b && (b = 0);
        SOUNDS_ENABLED && (soundManager.musicPlaying ?
            btnMenuSound.loadTexture(game.cache.getBitmapData("soundOnBtn")) : btnMenuSound.loadTexture(game.cache.getBitmapData("soundOffBtn")));
        ScenesTransitions.transitionStarted();
        ScenesTransitions.TRANSITION_EFFECT_IN = Phaser.Easing.Linear.In;
        ScenesTransitions.showSceneAlpha(grpSceneMenu, b + 100, ScenesTransitions.TRANSITION_LENGTH);
        ScenesTransitions.showSceneScale(imgLogo, b + 200, 200, null, Phaser.Easing.Back.Out);
        ScenesTransitions.showSceneScale(btnMenuPlay, b + 200, 200, ScenesTransitions.transitionFinished, Phaser.Easing.Back.Out);
        ScenesTransitions.TRANSITION_EFFECT_IN = Phaser.Easing.Linear.In
    },
    HideAnimated: function() {
        ScenesTransitions.transitionStarted();
        ScenesTransitions.TRANSITION_EFFECT_OUT = Phaser.Easing.Linear.Out;
        ScenesTransitions.hideSceneScale(imgLogo, 0, 200, null, Phaser.Easing.Back.In);
        ScenesTransitions.hideSceneScale(btnMenuPlay, 0, 200, null, Phaser.Easing.Back.In);
        ScenesTransitions.hideSceneAlpha(grpSceneMenu, 100, ScenesTransitions.TRANSITION_LENGTH, ScenesTransitions.transitionFinished);
        ScenesTransitions.TRANSITION_EFFECT_OUT =
            Phaser.Easing.Linear.Out
    }
};
var DURATION_ZOOM_IN = .6 * ScenesTransitions.TRANSITION_LENGTH,
    gameRunning = !1,
    gamePaused = !1,
    TIME_END = 1500,
    undo = 10,
    DESTROY_TILE_TIME = 100,
    MOVE_SPEED = 100,
    DRAG_OFFSET = 0,
    moves = 0,
    undoMoves = undo,
    tutorialStartStage = 1,
    gameBoardShadow = Array(8),
    gameBoardSprites = Array(8),
    gameBoardHistory = Array(8),
    shadowBlocks = Array(3),
    gameBlocks = Array(3),
    gameBlocksHistory = null,
    shadowBlocksHistory = null,
    scoreHistory = 0,
    ScoreText, finisDestroyRow = !1,
    finisDestroyCol = !1,
    particle, twn1 = null,
    twn2 = null,
    twn3 = null,
    dialogTwn = null,
    undoTwn = null,
    hand1, hand2, hand3, hand4, SceneGame = function() {
        SceneGame.instance = this;
        this.create()
    };
SceneGame.instance = null;
SceneGame.prototype = {
    create: function() {
        score = 0;
        undoMoves = undo;
        tutorialStage = tutorialStartStage;
        moves = 0;
        null === tutorial && (tutorial = !0);
        null === bestScore && (bestScore = 0);
        for (var b = 0; 8 > b; b++) gameBoardSprites[b] = Array(8), gameBoardShadow[b] = Array(8), gameBoardHistory[b] = Array(8);
        grpSceneGame = game.add.group();
        grpSceneGame.name = "SceneGame";
        imgGameBoard = grpSceneGame.create((game.width >> 1) - 200, (game.height >> 1) - 300, "board");
        grpSceneGame.add(imgGameBoard);
        this.createDialogMenu1(395, 140, "dialogBG");
        b = game.make.sprite(game.width >>
            1, (game.height >> 1) + 230, game.cache.getBitmapData("dialogBG"));
        b.anchor.set(.5);
        grpSceneGame.add(b);
        this.createDialogMenu1(150, 60, "dialogBG");
        b = game.make.sprite((game.width >> 1) - 125, (game.height >> 1) - 330, game.cache.getBitmapData("dialogBG"));
        b.anchor.set(.5);
        grpSceneGame.add(b);
        this.createDialogMenu1(150, 60, "dialogBG");
        b = game.make.sprite((game.width >> 1) + 35, (game.height >> 1) - 330, game.cache.getBitmapData("dialogBG"));
        b.anchor.set(.5);
        grpSceneGame.add(b);
        ScoreText = game.make.text(game.width >> 1, game.height >>
            1, score, {
                font: '30px "gameFont"',
                fill: "#FFC575"
            });
        ScoreText.x = (game.width >> 1) + 30 - ScoreText.width / 2;
        ScoreText.y = (game.height >> 1) - 365 + ScoreText.height / 2;
        grpSceneGame.addChild(ScoreText);
        bestScoreText = game.make.text(game.width >> 1, game.height >> 1, bestScore, {
            font: '30px "gameFont"',
            fill: "#FFC575"
        });
        bestScoreText.x = (game.width >> 1) - 110 - bestScoreText.width / 2;
        bestScoreText.y = (game.height >> 1) - 365 + bestScoreText.height / 2;
        grpSceneGame.addChild(bestScoreText);
        b = grpSceneGame.create((game.width >> 1) - 225, (game.height >>
            1) - 330, "cup");
        b.scale.set(1.2);
        b.anchor.x = 0;
        b.anchor.y = .5;
        grpSceneGame.add(b);
        this.createBtnImg("icon", 0, "icons", 9, "pauseBtn");
        btnGamePause = grpSceneGame.create((game.width >> 1) + 160, (game.height >> 1) - 330, game.cache.getBitmapData("pauseBtn"));
        btnGamePause.anchor.set(.5);
        AddButtonEvents(btnGamePause, this.OnPressedFromGameToPause, ButtonOnInputOver, ButtonOnInputOut);
        grpSceneGame.visible = !1;
        undoBtn = grpSceneGame.create(game.width >> 1, (game.height >> 1) + 350, "undo", 0);
        undoTxt = this.createBtnTxt(undoBtn, 0, -5, undoMoves);
        undoBtn.addChild(undoTxt);
        undoBtn.anchor.set(.5);
        AddButtonEvents(undoBtn, this.OnPressedUndo, ButtonOnInputOver, ButtonOnInputOut);
        this.toogleUndo(!1);
        grpSceneGame.visible = !1;
        this.isMobile() && (DRAG_OFFSET = 150);
        grpBlocks = game.add.group();
        grpBlocks.name = "grpBlocks";
        grpSceneGame.addChild(grpBlocks);
        grpTwn = game.add.group();
        grpTwn.name = "SceneTwn";
        grpSceneGame.addChild(grpTwn);
        this.generateNewBlocks();
        hand1 = grpTwn.create(gameBlocks[0].dragStartPoint[0] + 10, gameBlocks[0].dragStartPoint[1], "hand");
        hand1.anchor.set(.1);
        hand1.scale.set(.5);
        hand1.visible = !1;
        hand2 = grpTwn.create(gameBlocks[2].dragStartPoint[0], gameBlocks[2].dragStartPoint[1] + 20, "hand");
        hand2.anchor.set(.1);
        hand2.scale.set(.5);
        hand2.visible = !1;
        hand3 = grpTwn.create(gameBlocks[1].dragStartPoint[0] + 10, gameBlocks[1].dragStartPoint[1] + 10, "hand");
        hand3.anchor.set(.1);
        hand3.scale.set(.5);
        hand3.visible = !1;
        hand4 = grpTwn.create(game.width / 2 - 10, (game.height >> 1) + 332, "hand");
        hand4.anchor.set(.1);
        hand4.scale.set(.3);
        hand4.visible = !1;
        this.initGameBoard();
        tutorial && 1 ===
            tutorialStage && (this.immovableBlocks(), gameBlocks[0].inputEnabled = !0);
        this.logGameBoard();
        particle = game.add.sprite(-100, -100, "particle");
        gameRunning = !1
    },
    onGameStart: function() {},
    OnRestart: function() {
        undoMoves = undo;
        score = moves = 0;
        tutorialStage = 1;
        this.toogleUndo(!1);
        for (var b = 0; b < gameBlocks.length; b++) null != gameBlocks[b] && (gameBlocks[b].visible = !1), gameBlocks[b] = null;
        this.ResetGameBoard();
        this.generateNewBlocks();
        this.initGameBoard()
    },
    ResetGameBoard: function() {
        for (var b = 0; b < BOARD_SIZE; b++)
            for (var a =
                    0; a < BOARD_SIZE; a++) gameBoardSprites[b][a].visible = !1, gameBoardSprites[b][a] = null, gameBoardHistory[b][a] = null, gameBoardShadow[b][a] = 0
    },
    isMobile: function() {
        return /Android|webOS|iPhone|iPad|BlackBerry|Windows Phone|Opera Mini|IEMobile|Mobile/i.test(navigator.userAgent) ? !0 : !1
    },
    OnPressedTest: function() {
        /Android|webOS|iPhone|iPad|BlackBerry|Windows Phone|Opera Mini|IEMobile|Mobile/i.test(navigator.userAgent) ? alert("Mobile Device") : alert("PC")
    },
    toogleUndo: function(b) {
        b ? (undoBtn.loadTexture("undo", 1), undoBtn.children[0].visible = !1) : (undoBtn.loadTexture("undo", 0), undoBtn.children[0].visible = !0, undoBtn.children[0].text = undo);
        undoBtn.inputEnabled = b
    },
    blockUpdate: function() {
        moves++;
        undoMoves--;
        undoBtn.children[0].text = undoMoves;
        0 === undoMoves && (undoBtn.inputEnabled || soundManager.playSound("undo_loaded"), tutorial && (hand4.y = (game.height >> 1) + 332, hand4.x = game.width / 2 - 10, hand4.visible = !0, undoTwn = game.add.tween(hand4.scale).to({
                x: .5,
                y: .5
            }, 250, Phaser.Easing.Linear.None, !0, 0, -1, !0), this.immovableBlocks()), this.toogleUndo(!0), undoMoves =
            undo);
        return 3 === moves ? (moves = 0, this.generateNewBlocks(), !0) : !1
    },
    moveBlocksFromRight: function() {
        for (var b = 0; b < gameBlocks.length; b++) game.add.tween(gameBlocks[b]).to({
            alpha: 1
        }, MOVE_SPEED, Phaser.Easing.Linear.None, !0), gameBlocks[b].inputEnabled = !0
    },
    generateNewBlocks: function() {
        var b, a;
        a = Math.floor(36 * Math.random());
        tutorial && 2 > tutorialStage && (a = 22);
        b = Math.floor(6 * Math.random());
        var c = this.initBlocks(a, b),
            e = grpBlocks.create((game.width >> 1) - 120 - game.cache.getBitmapData(c).width / 2, (game.height >> 1) + 230 -
                game.cache.getBitmapData(c).height / 2, game.cache.getBitmapData(c));
        e.dragStartPoint = [(game.width >> 1) - 120 - game.cache.getBitmapData(c).width / 2, (game.height >> 1) + 230 - game.cache.getBitmapData(c).height / 2];
        e.alpha = 0;
        e.name = c;
        e.data[0] = a;
        e.data[1] = b;
        e.data[2] = 0;
        e.data[3] = c;
        e.data[4] = 0;
        this.setHitArea(e);
        e.inputEnabled = !0;
        e.input.enableDrag(!1, !0);
        e.events.onInputDown.add(this.dragStart, this);
        e.events.onDragUpdate.add(this.dragUpdate, this);
        e.events.onDragStop.add(this.dragStop, this);
        gameBlocks[0] = e;
        e = grpBlocks.create(0 -
            game.cache.getBitmapData(c + "Sh").width, 0 - game.cache.getBitmapData(c + "Sh").height, game.cache.getBitmapData(c + "Sh"));
        e.visible = !1;
        e.name = c + "Sh";
        e.data[0] = a;
        e.data[1] = b;
        e.data[2] = 0;
        e.data[3] = c + "Sh";
        shadowBlocks[0] = e;
        a = Math.floor(36 * Math.random());
        tutorial && 2 > tutorialStage && (a = 3);
        b = Math.floor(6 * Math.random());
        c = this.initBlocks(a, b);
        e = grpBlocks.create((game.width >> 1) - game.cache.getBitmapData(c).width / 2, (game.height >> 1) + 230 - game.cache.getBitmapData(c).height / 2, game.cache.getBitmapData(c));
        e.dragStartPoint = [(game.width >> 1) - game.cache.getBitmapData(c).width / 2, (game.height >> 1) + 230 - game.cache.getBitmapData(c).height / 2];
        e.alpha = 0;
        e.data[0] = a;
        e.data[1] = b;
        e.data[2] = 1;
        e.data[3] = c;
        e.data[4] = 0;
        e.name = c;
        this.setHitArea(e);
        e.inputEnabled = !0;
        e.input.enableDrag(!1, !0);
        e.events.onInputDown.add(this.dragStart, this);
        e.events.onDragUpdate.add(this.dragUpdate, this);
        e.events.onDragStop.add(this.dragStop, this);
        gameBlocks[1] = e;
        e = grpBlocks.create(0 - game.cache.getBitmapData(c + "Sh").width, 0 - game.cache.getBitmapData(c + "Sh").height,
            game.cache.getBitmapData(c + "Sh"));
        e.visible = !1;
        e.name = c + "Sh";
        e.data[0] = a;
        e.data[1] = b;
        e.data[2] = 1;
        e.data[3] = c + "Sh";
        shadowBlocks[1] = e;
        a = Math.floor(36 * Math.random());
        tutorial && 2 > tutorialStage && (a = 23);
        b = Math.floor(6 * Math.random());
        c = this.initBlocks(a, b);
        e = grpBlocks.create((game.width >> 1) + 120 - game.cache.getBitmapData(c).width / 2, (game.height >> 1) + 230 - game.cache.getBitmapData(c).height / 2, game.cache.getBitmapData(c));
        e.dragStartPoint = [(game.width >> 1) + 120 - game.cache.getBitmapData(c).width / 2, (game.height >> 1) +
            230 - game.cache.getBitmapData(c).height / 2
        ];
        e.alpha = 0;
        e.data[0] = a;
        e.data[1] = b;
        e.data[2] = 2;
        e.data[3] = c;
        e.data[4] = 0;
        e.name = c;
        this.setHitArea(e);
        e.inputEnabled = !0;
        e.input.enableDrag(!1, !0);
        e.events.onInputDown.add(this.dragStart, this);
        e.events.onDragUpdate.add(this.dragUpdate, this);
        e.events.onDragStop.add(this.dragStop, this);
        gameBlocks[2] = e;
        e = grpBlocks.create(0 - game.cache.getBitmapData(c + "Sh").width, 0 - game.cache.getBitmapData(c + "Sh").height, game.cache.getBitmapData(c + "Sh"));
        e.visible = !1;
        e.name = c + "Sh";
        e.data[0] = a;
        e.data[1] = b;
        e.data[2] = 2;
        e.data[3] = c + "Sh";
        shadowBlocks[2] = e;
        if (tutorial && 3 === tutorialStage)
            for (this.immovableBlocks(), b = 0; b < gameBlocks.length; b++) gameBlocks[b].alpha = 0;
        else this.moveBlocksFromRight()
    },
    setHitArea: function(b) {
        var a = 5 * TILE_SIZE_SMALL,
            c = 5 * TILE_SIZE_SMALL,
            e = 0,
            d = 0;
        b.width < a && (e = (a - b.width) / 2);
        b.height < c && (d = (c - b.height) / 2);
        b.hitArea = new Phaser.Rectangle(-e, -d, b.width + 2 * e, b.height + 2 * d)
    },
    initBlocks: function(b, a) {
        switch (b) {
            case 0:
                return this.createSmallBlock(b, a, "tilesSmall", "z1"),
                    this.createBlock(b, a, "tiles2", "z1Sh"), "z1";
            case 1:
                return this.createSmallBlock(b, a, "tilesSmall", "z2"), this.createBlock(b, a, "tiles2", "z2Sh"), "z2";
            case 2:
                return this.createSmallBlock(b, a, "tilesSmall", "3x3"), this.createBlock(b, a, "tiles2", "3x3Sh"), "3x3";
            case 3:
                return this.createSmallBlock(b, a, "tilesSmall", "2x2"), this.createBlock(b, a, "tiles2", "2x2Sh"), "2x2";
            case 4:
                return this.createSmallBlock(b, a, "tilesSmall", "3x3L1"), this.createBlock(b, a, "tiles2", "3x3L1Sh"), "3x3L1";
            case 5:
                return this.createSmallBlock(b,
                    a, "tilesSmall", "3x3L2"), this.createBlock(b, a, "tiles2", "3x3L2Sh"), "3x3L2";
            case 6:
                return this.createSmallBlock(b, a, "tilesSmall", "3x3L3"), this.createBlock(b, a, "tiles2", "3x3L3Sh"), "3x3L3";
            case 7:
                return this.createSmallBlock(b, a, "tilesSmall", "3x3L4"), this.createBlock(b, a, "tiles2", "3x3L4Sh"), "3x3L4";
            case 8:
                return this.createSmallBlock(b, a, "tilesSmall", "2x2L1"), this.createBlock(b, a, "tiles2", "2x2L1Sh"), "2x2L1";
            case 9:
                return this.createSmallBlock(b, a, "tilesSmall", "2x2L2"), this.createBlock(b, a, "tiles2", "2x2L2Sh"),
                    "2x2L2";
            case 10:
                return this.createSmallBlock(b, a, "tilesSmall", "2x2L3"), this.createBlock(b, a, "tiles2", "2x2L3Sh"), "2x2L3";
            case 11:
                return this.createSmallBlock(b, a, "tilesSmall", "2x2L4"), this.createBlock(b, a, "tiles2", "2x2L4Sh"), "2x2L4";
            case 12:
                return this.createSmallBlock(b, a, "tilesSmall", "3x2L1"), this.createBlock(b, a, "tiles2", "3x2L1Sh"), "3x2L1";
            case 13:
                return this.createSmallBlock(b, a, "tilesSmall", "3x2L2"), this.createBlock(b, a, "tiles2", "3x2L2Sh"), "3x2L2";
            case 14:
                return this.createSmallBlock(b, a, "tilesSmall",
                    "3x2L3"), this.createBlock(b, a, "tiles2", "3x2L3Sh"), "3x2L3";
            case 15:
                return this.createSmallBlock(b, a, "tilesSmall", "3x2L4"), this.createBlock(b, a, "tiles2", "3x2L4Sh"), "3x2L4";
            case 16:
                return this.createSmallBlock(b, a, "tilesSmall", "3x2L5"), this.createBlock(b, a, "tiles2", "3x2L5Sh"), "3x2L5";
            case 17:
                return this.createSmallBlock(b, a, "tilesSmall", "3x2L6"), this.createBlock(b, a, "tiles2", "3x2L6Sh"), "3x2L6";
            case 18:
                return this.createSmallBlock(b, a, "tilesSmall", "3x2L7"), this.createBlock(b, a, "tiles2", "3x2L7Sh"), "3x2L7";
            case 19:
                return this.createSmallBlock(b, a, "tilesSmall", "3x2L8"), this.createBlock(b, a, "tiles2", "3x2L8Sh"), "3x2L8";
            case 20:
                return this.createSmallBlock(b, a, "tilesSmall", "1x1"), this.createBlock(b, a, "tiles2", "1x1Sh"), "1x1";
            case 21:
                return this.createSmallBlock(b, a, "tilesSmall", "1x2v"), this.createBlock(b, a, "tiles2", "1x2vSh"), "1x2v";
            case 22:
                return this.createSmallBlock(b, a, "tilesSmall", "1x2h"), this.createBlock(b, a, "tiles2", "1x2hSh"), "1x2h";
            case 23:
                return this.createSmallBlock(b, a, "tilesSmall", "1x3v"), this.createBlock(b,
                    a, "tiles2", "1x3vSh"), "1x3v";
            case 24:
                return this.createSmallBlock(b, a, "tilesSmall", "1x3h"), this.createBlock(b, a, "tiles2", "1x3hSh"), "1x3h";
            case 25:
                return this.createSmallBlock(b, a, "tilesSmall", "1x4v"), this.createBlock(b, a, "tiles2", "1x4vSh"), "1x4v";
            case 26:
                return this.createSmallBlock(b, a, "tilesSmall", "1x4h"), this.createBlock(b, a, "tiles2", "1x4hSh"), "1x4h";
            case 27:
                return this.createSmallBlock(b, a, "tilesSmall", "1x5v"), this.createBlock(b, a, "tiles2", "1x5vSh"), "1x5v";
            case 28:
                return this.createSmallBlock(b,
                    a, "tilesSmall", "1x5h"), this.createBlock(b, a, "tiles2", "1x5hSh"), "1x5h";
            case 29:
                return this.createSmallBlock(b, a, "tilesSmall", "3x1t1"), this.createBlock(b, a, "tiles2", "3x1t1Sh"), "3x1t1";
            case 30:
                return this.createSmallBlock(b, a, "tilesSmall", "3x1t2"), this.createBlock(b, a, "tiles2", "3x1t2Sh"), "3x1t2";
            case 31:
                return this.createSmallBlock(b, a, "tilesSmall", "3x1t3"), this.createBlock(b, a, "tiles2", "3x1t3Sh"), "3x1t3";
            case 32:
                return this.createSmallBlock(b, a, "tilesSmall", "3x1t4"), this.createBlock(b, a, "tiles2", "3x1t4Sh"),
                    "3x1t4";
            case 33:
                return this.createSmallBlock(b, a, "tilesSmall", "z2v"), this.createBlock(b, a, "tiles2", "z2vSh"), "z2v";
            case 34:
                return this.createSmallBlock(b, a, "tilesSmall", "z2h"), this.createBlock(b, a, "tiles2", "z2hSh"), "z2h";
            case 35:
                return this.createSmallBlock(b, a, "tilesSmall", "kriz"), this.createBlock(b, a, "tiles2", "krizSh"), "kriz"
        }
    },
    gameBoardShadowUpdate: function() {
        for (var b = 0; b < BOARD_SIZE; b++)
            for (var a = 0; a < BOARD_SIZE; a++) gameBoardShadow[b][a] = !0 === gameBoardSprites[b][a].visible ? 1 : 0
    },
    returnColor: function() {
        for (var b =
                0; b < BOARD_SIZE; b++)
            for (var a = 0; a < BOARD_SIZE; a++) !0 === gameBoardSprites[b][a].visible && gameBoardSprites[b][a].loadTexture("tiles", gameBoardSprites[b][a].data[1])
    },
    dragUpdate: function(b) {
        this.returnColor();
        var a, c, e = shadowBlocks[b.data[2]];
        b.y -= DRAG_OFFSET;
        if (b.y > 533 + TILE_SIZE_BIG / 2 || b.y < 149 - TILE_SIZE_BIG / 2 || b.x > 430 + TILE_SIZE_BIG / 2 || b.x < 49 - TILE_SIZE_BIG / 2 || b.y + e.height > 533 + TILE_SIZE_BIG / 2 || b.x + e.width > 430 + TILE_SIZE_BIG / 2) e.visible = !1;
        else if (b.x + TILE_SIZE_BIG / 2 < 49 + TILE_SIZE_BIG && 49 <= b.x + TILE_SIZE_BIG /
            2 ? (e.x = 49, a = 0) : b.x + TILE_SIZE_BIG / 2 < 49 + 2 * TILE_SIZE_BIG && b.x + TILE_SIZE_BIG / 2 >= 49 + TILE_SIZE_BIG ? (e.x = 49 + TILE_SIZE_BIG, a = 1) : b.x + TILE_SIZE_BIG / 2 < 49 + 3 * TILE_SIZE_BIG && b.x + TILE_SIZE_BIG / 2 >= 49 + 2 * TILE_SIZE_BIG ? (e.x = 49 + 2 * TILE_SIZE_BIG, a = 2) : b.x + TILE_SIZE_BIG / 2 < 49 + 4 * TILE_SIZE_BIG && b.x + TILE_SIZE_BIG / 2 >= 49 + 3 * TILE_SIZE_BIG ? (e.x = 49 + 3 * TILE_SIZE_BIG, a = 3) : b.x + TILE_SIZE_BIG / 2 < 49 + 5 * TILE_SIZE_BIG && b.x + TILE_SIZE_BIG / 2 >= 49 + 4 * TILE_SIZE_BIG ? (e.x = 49 + 4 * TILE_SIZE_BIG, a = 4) : b.x + TILE_SIZE_BIG / 2 < 49 + 6 * TILE_SIZE_BIG && b.x + TILE_SIZE_BIG /
            2 >= 49 + 5 * TILE_SIZE_BIG ? (e.x = 49 + 5 * TILE_SIZE_BIG, a = 5) : b.x + TILE_SIZE_BIG / 2 < 49 + 7 * TILE_SIZE_BIG && b.x + TILE_SIZE_BIG / 2 >= 49 + 6 * TILE_SIZE_BIG ? (e.x = 49 + 6 * TILE_SIZE_BIG, a = 6) : b.x + TILE_SIZE_BIG / 2 < 49 + 8 * TILE_SIZE_BIG && b.x + TILE_SIZE_BIG / 2 >= 49 + 7 * TILE_SIZE_BIG && (e.x = 49 + 7 * TILE_SIZE_BIG, a = 7), b.y + TILE_SIZE_BIG / 2 < 149 + TILE_SIZE_BIG && 149 <= b.y + TILE_SIZE_BIG / 2 ? (e.y = 149, c = 0) : b.y + TILE_SIZE_BIG / 2 < 149 + 2 * TILE_SIZE_BIG && b.y + TILE_SIZE_BIG / 2 >= 149 + TILE_SIZE_BIG ? (e.y = 149 + TILE_SIZE_BIG, c = 1) : b.y + TILE_SIZE_BIG / 2 < 149 + 3 * TILE_SIZE_BIG && b.y +
            TILE_SIZE_BIG / 2 >= 149 + 2 * TILE_SIZE_BIG ? (e.y = 149 + 2 * TILE_SIZE_BIG, c = 2) : b.y + TILE_SIZE_BIG / 2 < 149 + 4 * TILE_SIZE_BIG && b.y + TILE_SIZE_BIG / 2 >= 149 + 3 * TILE_SIZE_BIG ? (e.y = 149 + 3 * TILE_SIZE_BIG, c = 3) : b.y + TILE_SIZE_BIG / 2 < 149 + 5 * TILE_SIZE_BIG && b.y + TILE_SIZE_BIG / 2 >= 149 + 4 * TILE_SIZE_BIG ? (e.y = 149 + 4 * TILE_SIZE_BIG, c = 4) : b.y + TILE_SIZE_BIG / 2 < 149 + 6 * TILE_SIZE_BIG && b.y + TILE_SIZE_BIG / 2 >= 149 + 5 * TILE_SIZE_BIG ? (e.y = 149 + 5 * TILE_SIZE_BIG, c = 5) : b.y + TILE_SIZE_BIG / 2 < 149 + 7 * TILE_SIZE_BIG && b.y + TILE_SIZE_BIG / 2 >= 149 + 6 * TILE_SIZE_BIG ? (e.y = 149 + 6 * TILE_SIZE_BIG,
                c = 6) : b.y + TILE_SIZE_BIG / 2 < 149 + 8 * TILE_SIZE_BIG && b.y + TILE_SIZE_BIG / 2 >= 149 + 7 * TILE_SIZE_BIG && (e.y = 149 + 7 * TILE_SIZE_BIG, c = 7), this.checkShadow(c, a, b)) {
            a = this.checkingCol();
            c = this.checkingRow();
            for (var d = 0; d < c.length; d++) this.rowColor(c[d], b.data[1]);
            for (d = 0; d < a.length; d++) this.colColor(a[d], b.data[1]);
            e.visible = !0
        } else e.visible = !1
    },
    checkingCol: function() {
        for (var b = 0, a = [], c = 0; 8 > c; c++) {
            for (var e = 0; 8 > e; e++) 1 === gameBoardShadow[e][c] && b++;
            8 === b && a.push(c);
            b = 0
        }
        return a
    },
    checkingRow: function() {
        for (var b = 0, a = [],
                c = 0; 8 > c; c++) {
            for (var e = 0; 8 > e; e++) 1 === gameBoardShadow[c][e] && b++;
            8 === b && a.push(c);
            b = 0
        }
        return a
    },
    rowColor: function(b, a) {
        for (var c = 0; c < BOARD_SIZE; c++) gameBoardSprites[b][c].loadTexture("tiles", a)
    },
    colColor: function(b, a) {
        for (var c = 0; c < BOARD_SIZE; c++) gameBoardSprites[c][b].loadTexture("tiles", a)
    },
    immovableBlocks: function(b) {
        if (void 0 != b)
            for (var a = 0; a < gameBlocks.length; a++) null != gameBlocks[a] && a !== b && (gameBlocks[a].inputEnabled = !1);
        else
            for (a = 0; a < gameBlocks.length; a++) null != gameBlocks[a] && (gameBlocks[a].inputEnabled = !1)
    },
    movableBlocks: function() {
        for (var b = 0; b < gameBlocks.length; b++) null != gameBlocks[b] && 0 === gameBlocks[b].data[4] && (gameBlocks[b].inputEnabled = !0)
    },
    getPositionX: function(b) {
        return b.x + TILE_SIZE_BIG / 2 < 49 + TILE_SIZE_BIG && 49 <= b.x + TILE_SIZE_BIG / 2 ? (b.x = 49, 0) : b.x + TILE_SIZE_BIG / 2 < 49 + 2 * TILE_SIZE_BIG && b.x + TILE_SIZE_BIG / 2 >= 49 + TILE_SIZE_BIG ? (b.x = 49 + TILE_SIZE_BIG, 1) : b.x + TILE_SIZE_BIG / 2 < 49 + 3 * TILE_SIZE_BIG && b.x + TILE_SIZE_BIG / 2 >= 49 + 2 * TILE_SIZE_BIG ? (b.x = 49 + 2 * TILE_SIZE_BIG, 2) : b.x + TILE_SIZE_BIG / 2 < 49 + 4 * TILE_SIZE_BIG &&
            b.x + TILE_SIZE_BIG / 2 >= 49 + 3 * TILE_SIZE_BIG ? (b.x = 49 + 3 * TILE_SIZE_BIG, 3) : b.x + TILE_SIZE_BIG / 2 < 49 + 5 * TILE_SIZE_BIG && b.x + TILE_SIZE_BIG / 2 >= 49 + 4 * TILE_SIZE_BIG ? (b.x = 49 + 4 * TILE_SIZE_BIG, 4) : b.x + TILE_SIZE_BIG / 2 < 49 + 6 * TILE_SIZE_BIG && b.x + TILE_SIZE_BIG / 2 >= 49 + 5 * TILE_SIZE_BIG ? (b.x = 49 + 5 * TILE_SIZE_BIG, 5) : b.x + TILE_SIZE_BIG / 2 < 49 + 7 * TILE_SIZE_BIG && b.x + TILE_SIZE_BIG / 2 >= 49 + 6 * TILE_SIZE_BIG ? (b.x = 49 + 6 * TILE_SIZE_BIG, 6) : b.x + TILE_SIZE_BIG / 2 < 49 + 8 * TILE_SIZE_BIG && b.x + TILE_SIZE_BIG / 2 >= 49 + 7 * TILE_SIZE_BIG ? (b.x = 49 + 7 * TILE_SIZE_BIG, 7) : -1
    },
    getPositionY: function(b) {
        return b.y +
            TILE_SIZE_BIG / 2 < 149 + TILE_SIZE_BIG && 149 <= b.y + TILE_SIZE_BIG / 2 ? (b.y = 149, 0) : b.y + TILE_SIZE_BIG / 2 < 149 + 2 * TILE_SIZE_BIG && b.y + TILE_SIZE_BIG / 2 >= 149 + TILE_SIZE_BIG ? (b.y = 149 + TILE_SIZE_BIG, 1) : b.y + TILE_SIZE_BIG / 2 < 149 + 3 * TILE_SIZE_BIG && b.y + TILE_SIZE_BIG / 2 >= 149 + 2 * TILE_SIZE_BIG ? (b.y = 149 + 2 * TILE_SIZE_BIG, 2) : b.y + TILE_SIZE_BIG / 2 < 149 + 4 * TILE_SIZE_BIG && b.y + TILE_SIZE_BIG / 2 >= 149 + 3 * TILE_SIZE_BIG ? (b.y = 149 + 3 * TILE_SIZE_BIG, 3) : b.y + TILE_SIZE_BIG / 2 < 149 + 5 * TILE_SIZE_BIG && b.y + TILE_SIZE_BIG / 2 >= 149 + 4 * TILE_SIZE_BIG ? (b.y = 149 + 4 * TILE_SIZE_BIG,
                4) : b.y + TILE_SIZE_BIG / 2 < 149 + 6 * TILE_SIZE_BIG && b.y + TILE_SIZE_BIG / 2 >= 149 + 5 * TILE_SIZE_BIG ? (b.y = 149 + 5 * TILE_SIZE_BIG, 5) : b.y + TILE_SIZE_BIG / 2 < 149 + 7 * TILE_SIZE_BIG && b.y + TILE_SIZE_BIG / 2 >= 149 + 6 * TILE_SIZE_BIG ? (b.y = 149 + 6 * TILE_SIZE_BIG, 6) : b.y + TILE_SIZE_BIG / 2 < 149 + 8 * TILE_SIZE_BIG && b.y + TILE_SIZE_BIG / 2 >= 149 + 7 * TILE_SIZE_BIG ? (b.y = 149 + 7 * TILE_SIZE_BIG, 7) : -1
    },
    twnResume: function() {
        switch (tutorialStage) {
            case 1:
                hand1.visible = !0;
                break;
            case 2:
                hand2.visible = !0;
                break;
            case 3:
                hand3.visible = !0
        }
    },
    update: function() {},
    dragStart: function(b) {
        soundManager.playSound("tileSelect");
        var a = this.createBlock(b.data[0], b.data[1], "tiles", "dragStart");
        b.loadTexture(game.cache.getBitmapData(a));
        this.immovableBlocks(b.data[2]);
        if (tutorial) switch (tutorialStage) {
            case 1:
                hand1.visible = !1;
                break;
            case 2:
                hand2.visible = !1;
                break;
            case 3:
                hand3.visible = !1
        }
    },
    dragStop: function(b) {
        soundManager.playSound("tileSelect");
        var a = b.data[2],
            c, e;
        this.immovableBlocks();
        if (tutorial) switch (c = this.getPositionX(b), e = this.getPositionY(b), tutorialStage) {
            case 1:
                3 === c && 4 === e ? (this.dragStopProces(b), gameBlocks[2].inputEnabled = !0, tutorialStage++) : (this.twnResume(), this.returnColor(), this.returnTileToStartPosition(b), b = shadowBlocks[a], b.visible = !1, gameBlocks[0].inputEnabled = !0);
                break;
            case 2:
                4 === c && 3 === e ? (this.dragStopProces(b), gameBlocks[1].inputEnabled = !0, tutorialStage++) : (this.twnResume(), this.returnColor(), this.returnTileToStartPosition(b), b = shadowBlocks[a], b.visible = !1, gameBlocks[2].inputEnabled = !0);
                break;
            case 3:
                3 === c && 3 === e ? (this.dragStopProces(b), tutorialStage++) : (this.twnResume(), this.returnColor(), this.returnTileToStartPosition(b),
                    b = shadowBlocks[a], b.visible = !1, this.movableBlocks());
                break;
            case 11:
                this.tileInBoard(b) ? this.returnTileToStartPosition(b) : (this.dragStopProces(b), tutorialStage++);
                break;
            default:
                this.tileInBoard(b) ? this.returnTileToStartPosition(b) : (this.dragStopProces(b), tutorialStage++), 11 !== tutorialStage && this.movableBlocks()
        } else this.tileInBoard(b) ? this.returnTileToStartPosition(b) : this.dragStopProces(b), this.movableBlocks()
    },
    dragStopProces: function(b) {
        var a = b.data[2],
            c = this.getPositionX(b),
            e = this.getPositionY(b),
            d = b.data;
        this.storeToGameBoard(e, c, b) ? (this.returnColor(), shadowBlocks[a].visible = !1, shadowBlocksHistory = shadowBlocks[a], shadowBlocks[a] = null, this.destroyTween(), this.gameBoardManager(a, d)) : (tutorialStage--, this.returnTileToStartPosition(b))
    },
    tileInBoard: function(b) {
        return b.y > 533 + TILE_SIZE_BIG / 2 || b.y < 149 - TILE_SIZE_BIG / 2 || b.x > 430 + TILE_SIZE_BIG / 2 || b.x < 49 - TILE_SIZE_BIG / 2 || b.y + b.height > 533 + TILE_SIZE_BIG / 2 || b.x + b.width > 430 + TILE_SIZE_BIG / 2
    },
    destroyTween: function() {
        if (tutorial) switch (tutorialStage) {
            case 1:
                hand1.visible = !1;
                twn1.stop();
                break;
            case 2:
                hand2.visible = !1;
                twn2.stop();
                break;
            case 3:
                hand3.visible = !1, twn3.stop()
        }
    },
    returnTileToStartPosition: function(b) {
        b.x = b.dragStartPoint[0];
        b.y = b.dragStartPoint[1];
        nameSprite = b.data[3];
        this.createSmallBlock(b.data[0], b.data[1], "tilesSmall", nameSprite);
        b.loadTexture(game.cache.getBitmapData(nameSprite))
    },
    gameBoardManager: function(b, a) {
        var c = this.checkRow(),
            e = this.checkCol();
        this.removeGameBlocks(b, a);
        this.scoreAdd(c.length + e.length);
        var d = c.length + e.length;
        if (0 !== d) switch (d) {
            case 1:
                game.camera.shake(.0025,
                    300);
                break;
            case 2:
                game.camera.shake(.005, 300);
                break;
            case 3:
                game.camera.shake(.01, 300);
                break;
            default:
                game.camera.shake(.015, 300)
        }
        tutorial && 3 === tutorialStage ? (this.blockUpdate(), grpSceneGame.children[1].alpha = 1, dialogTwn = game.add.tween(grpSceneGame.children[1]).to({
            alpha: 0
        }, 250, Phaser.Easing.Linear.None, !0, 0, 2, !0), dialogTwn.onComplete.add(this.moveBlocksFromRight, this)) : this.blockUpdate();
        0 === e.length ? this.destroyRow(c, a[1], !0) : this.destroyRow(c, a[1], !1);
        this.destroyCol(e, a[1]);
        0 === c.length && 0 === e.length &&
            this.checkMove();
        this.logGameBoard()
    },
    checkMove: function() {
        for (var b = 0; b < gameBlocks.length; b++)
            if (null != gameBlocks[b])
                if (this.checkBlock(gameBlocks[b])) {
                    var a = gameBlocks[b];
                    this.createSmallBlock(a.data[0], a.data[1], "tilesSmall2", "blocked");
                    a.loadTexture(game.cache.getBitmapData("blocked"));
                    a.inputEnabled = !1;
                    a.data[4] = 1;
                    gameBlocks[b] = a
                } else a = gameBlocks[b], this.isBlocked(a) && (this.createSmallBlock(a.data[0], a.data[1], "tilesSmall", "unBlocked"), a.loadTexture(game.cache.getBitmapData("unBlocked")), a.data[4] =
                    0, a.inputEnabled = !0, gameBlocks[b] = a);
        this.checkGameOver() && this.gameOverBlocks();
        tutorial && this.initTutorialBoard()
    },
    isBlocked: function(b) {
        return 1 === b.data[4] ? !0 : !1
    },
    scoreAdd: function(b) {
        switch (b) {
            case 1:
                scoreHistory = score;
                score += 100;
                soundManager.playSound("1rowDestroy");
                b = game.add.text(game.width >> 1, (game.height >> 1) - 50, "+100", {
                    font: '60px "gameFont"',
                    fill: "#FFC575"
                });
                b.anchor.setTo(.5, .5);
                twn = game.add.tween(b).to({
                    y: 10,
                    alpha: 0
                }, 1E3, "Linear", !0);
                break;
            case 2:
                scoreHistory = score;
                score += 300;
                soundManager.playSound("2rowDestroy");
                b = game.add.text(game.width >> 1, (game.height >> 1) - 50, "+300", {
                    font: '60px "gameFont"',
                    fill: "#FFC575"
                });
                b.anchor.setTo(.5, .5);
                twn = game.add.tween(b).to({
                    y: 10,
                    alpha: 0
                }, 1E3, "Linear", !0);
                break;
            case 3:
                scoreHistory = score;
                score += 600;
                soundManager.playSound("3rowDestroy");
                b = game.add.text(game.width >> 1, (game.height >> 1) - 50, "+600", {
                    font: '60px "gameFont"',
                    fill: "#FFC575"
                });
                b.anchor.setTo(.5, .5);
                twn = game.add.tween(b).to({
                    y: 10,
                    alpha: 0
                }, 1E3, "Linear", !0);
                break;
            case 4:
                scoreHistory = score;
                score += 1E3;
                soundManager.playSound("4rowDestroy");
                b = game.add.text(game.width >> 1, (game.height >> 1) - 50, "+1000", {
                    font: '60px "gameFont"',
                    fill: "#FFC575"
                });
                b.anchor.setTo(.5, .5);
                twn = game.add.tween(b).to({
                    y: 10,
                    alpha: 0
                }, 1E3, "Linear", !0);
                break;
            case 5:
                scoreHistory = score;
                score += 2E3;
                soundManager.playSound("5rowDestroy");
                b = game.add.text(game.width >> 1, (game.height >> 1) - 50, "+2000", {
                    font: '60px "gameFont"',
                    fill: "#FFC575"
                });
                b.anchor.setTo(.5, .5);
                twn = game.add.tween(b.scale).to({
                    x: 0,
                    y: 0
                }, 500, "Linear", !0);
                break;
            case 6:
                scoreHistory = score;
                score += 3E3;
                soundManager.playSound("6rowDestroy");
                b = game.add.text(game.width >> 1, (game.height >> 1) - 50, "+3000", {
                    font: '60px "gameFont"',
                    fill: "#FFC575"
                });
                b.anchor.setTo(.5, .5);
                twn = game.add.tween(b.scale).to({
                    x: 0,
                    y: 0
                }, 500, "Linear", !0);
                break;
            default:
                scoreHistory = score
        }
        ScoreText.x = (game.width >> 1) + 30 - ScoreText.width / 2;
        ScoreText.text = score
    },
    gameOverBlocks: function() {
        btnGamePause.inputEnabled = !1;
        soundManager.playSound("game_over");
        for (var b = [], a = [], c = 0; c < BOARD_SIZE; c++)
            for (var e = 0; e < BOARD_SIZE; e++) !0 === gameBoardSprites[c][e].visible && (b.push(c), a.push(e));
        for (var e = TIME_END / a.length, d = a.length - 1, c = 0; 0 < b.length;) {
            var f = Math.floor(Math.random() * b.length);
            game.time.events.add(c * e, this.changeSprite, this, gameBoardSprites[b[f]][a[f]]);
            c++;
            b.splice(f, 1);
            a.splice(f, 1)
        }
        game.time.events.add(d * e * 1.1, this.gameOver, this)
    },
    onGameOver: function(b) {
        this.showAdvert()
    },
    showAdvert: function() {},
    gameOver: function() {
        btnGamePause.inputEnabled = !0;
        SceneGame.instance.HideAnimated();
        SceneResult.instance.ShowAnimated();
        grpSceneGame.destroy()
    },
    changeSprite: function(b) {
        b.loadTexture("tiles2",
            b.data[1])
    },
    removeGameBlocks: function(b, a) {
        gameBlocksHistory = gameBlocks[b];
        gameBlocksHistory.data = a;
        gameBlocks[b] = null
    },
    checkShadow: function(b, a, c) {
        this.gameBoardShadowUpdate();
        switch (c.data[0]) {
            case 0:
                return !1 === gameBoardSprites[b][a].visible && !1 === gameBoardSprites[b][a + 1].visible && !1 === gameBoardSprites[b + 1][a + 2].visible && !1 === gameBoardSprites[b + 1][a + 1].visible ? (gameBoardShadow[b][a] = 1, gameBoardShadow[b][a + 1] = 1, gameBoardShadow[b + 1][a + 2] = 1, gameBoardShadow[b + 1][a + 1] = 1, !0) : !1;
            case 1:
                return !1 === gameBoardSprites[b][a +
                    1
                ].visible && !1 === gameBoardSprites[b + 1][a + 1].visible && !1 === gameBoardSprites[b + 1][a].visible && !1 === gameBoardSprites[b + 2][a].visible ? (gameBoardShadow[b][a + 1] = 1, gameBoardShadow[b + 1][a + 1] = 1, gameBoardShadow[b + 1][a] = 1, gameBoardShadow[b + 2][a] = 1, !0) : !1;
            case 2:
                return !1 === gameBoardSprites[b][a].visible && !1 === gameBoardSprites[b][a + 1].visible && !1 === gameBoardSprites[b][a + 2].visible && !1 === gameBoardSprites[b + 1][a].visible && !1 === gameBoardSprites[b + 1][a + 1].visible && !1 === gameBoardSprites[b + 1][a + 2].visible && !1 === gameBoardSprites[b +
                    2][a].visible && !1 === gameBoardSprites[b + 2][a + 1].visible && !1 === gameBoardSprites[b + 2][a + 2].visible ? (gameBoardShadow[b][a] = 1, gameBoardShadow[b][a + 1] = 1, gameBoardShadow[b][a + 2] = 1, gameBoardShadow[b + 1][a] = 1, gameBoardShadow[b + 1][a + 1] = 1, gameBoardShadow[b + 1][a + 2] = 1, gameBoardShadow[b + 2][a] = 1, gameBoardShadow[b + 2][a + 1] = 1, gameBoardShadow[b + 2][a + 2] = 1, !0) : !1;
            case 3:
                return !1 === gameBoardSprites[b][a].visible && !1 === gameBoardSprites[b][a + 1].visible && !1 === gameBoardSprites[b + 1][a].visible && !1 === gameBoardSprites[b + 1][a +
                    1
                ].visible ? (gameBoardShadow[b][a] = 1, gameBoardShadow[b][a + 1] = 1, gameBoardShadow[b + 1][a] = 1, gameBoardShadow[b + 1][a + 1] = 1, !0) : !1;
            case 4:
                return !1 === gameBoardSprites[b][a].visible && !1 === gameBoardSprites[b + 1][a].visible && !1 === gameBoardSprites[b + 2][a].visible && !1 === gameBoardSprites[b + 2][a + 1].visible && !1 === gameBoardSprites[b + 2][a + 2].visible ? (gameBoardShadow[b][a] = 1, gameBoardShadow[b + 1][a] = 1, gameBoardShadow[b + 2][a] = 1, gameBoardShadow[b + 2][a + 1] = 1, gameBoardShadow[b + 2][a + 2] = 1, !0) : !1;
            case 5:
                return !1 === gameBoardSprites[b][a +
                    2
                ].visible && !1 === gameBoardSprites[b + 1][a + 2].visible && !1 === gameBoardSprites[b + 2][a + 2].visible && !1 === gameBoardSprites[b + 2][a + 1].visible && !1 === gameBoardSprites[b + 2][a].visible ? (gameBoardShadow[b][a + 2] = 1, gameBoardShadow[b + 1][a + 2] = 1, gameBoardShadow[b + 2][a + 2] = 1, gameBoardShadow[b + 2][a + 1] = 1, gameBoardShadow[b + 2][a] = 1, !0) : !1;
            case 6:
                return !1 === gameBoardSprites[b][a].visible && !1 === gameBoardSprites[b + 1][a].visible && !1 === gameBoardSprites[b + 2][a].visible && !1 === gameBoardSprites[b][a + 1].visible && !1 === gameBoardSprites[b][a +
                    2
                ].visible ? (gameBoardShadow[b][a] = 1, gameBoardShadow[b + 1][a] = 1, gameBoardShadow[b + 2][a] = 1, gameBoardShadow[b][a + 1] = 1, gameBoardShadow[b][a + 2] = 1, !0) : !1;
            case 7:
                return !1 === gameBoardSprites[b][a].visible && !1 === gameBoardSprites[b][a + 1].visible && !1 === gameBoardSprites[b][a + 2].visible && !1 === gameBoardSprites[b + 1][a + 2].visible && !1 === gameBoardSprites[b + 2][a + 2].visible ? (gameBoardShadow[b][a] = 1, gameBoardShadow[b][a + 1] = 1, gameBoardShadow[b][a + 2] = 1, gameBoardShadow[b + 1][a + 2] = 1, gameBoardShadow[b + 2][a + 2] = 1, !0) : !1;
            case 8:
                return !1 ===
                    gameBoardSprites[b][a].visible && !1 === gameBoardSprites[b + 1][a].visible && !1 === gameBoardSprites[b + 1][a + 1].visible ? (gameBoardShadow[b][a] = 1, gameBoardShadow[b + 1][a] = 1, gameBoardShadow[b + 1][a + 1] = 1, !0) : !1;
            case 9:
                return !1 === gameBoardSprites[b][a + 1].visible && !1 === gameBoardSprites[b + 1][a].visible && !1 === gameBoardSprites[b + 1][a + 1].visible ? (gameBoardShadow[b][a + 1] = 1, gameBoardShadow[b + 1][a] = 1, gameBoardShadow[b + 1][a + 1] = 1, !0) : !1;
            case 10:
                return !1 === gameBoardSprites[b][a].visible && !1 === gameBoardSprites[b + 1][a].visible &&
                    !1 === gameBoardSprites[b][a + 1].visible ? (gameBoardShadow[b][a] = 1, gameBoardShadow[b + 1][a] = 1, gameBoardShadow[b][a + 1] = 1, !0) : !1;
            case 11:
                return !1 === gameBoardSprites[b][a + 1].visible && !1 === gameBoardSprites[b][a].visible && !1 === gameBoardSprites[b + 1][a + 1].visible ? (gameBoardShadow[b][a + 1] = 1, gameBoardShadow[b][a] = 1, gameBoardShadow[b + 1][a + 1] = 1, !0) : !1;
            case 12:
                return !1 === gameBoardSprites[b][a].visible && !1 === gameBoardSprites[b + 1][a].visible && !1 === gameBoardSprites[b + 2][a].visible && !1 === gameBoardSprites[b + 2][a + 1].visible ?
                    (gameBoardShadow[b][a] = 1, gameBoardShadow[b + 1][a] = 1, gameBoardShadow[b + 2][a] = 1, gameBoardShadow[b + 2][a + 1] = 1, !0) : !1;
            case 13:
                return !1 === gameBoardSprites[b][a + 1].visible && !1 === gameBoardSprites[b + 1][a + 1].visible && !1 === gameBoardSprites[b + 2][a].visible && !1 === gameBoardSprites[b + 2][a + 1].visible ? (gameBoardShadow[b][a + 1] = 1, gameBoardShadow[b + 1][a + 1] = 1, gameBoardShadow[b + 2][a] = 1, gameBoardShadow[b + 2][a + 1] = 1, !0) : !1;
            case 14:
                return !1 === gameBoardSprites[b][a].visible && !1 === gameBoardSprites[b + 1][a].visible && !1 === gameBoardSprites[b +
                    2][a].visible && !1 === gameBoardSprites[b][a + 1].visible ? (gameBoardShadow[b][a] = 1, gameBoardShadow[b + 1][a] = 1, gameBoardShadow[b + 2][a] = 1, gameBoardShadow[b][a + 1] = 1, !0) : !1;
            case 15:
                return !1 === gameBoardSprites[b][a].visible && !1 === gameBoardSprites[b][a + 1].visible && !1 === gameBoardSprites[b + 1][a + 1].visible && !1 === gameBoardSprites[b + 2][a + 1].visible ? (gameBoardShadow[b][a] = 1, gameBoardShadow[b][a + 1] = 1, gameBoardShadow[b + 1][a + 1] = 1, gameBoardShadow[b + 2][a + 1] = 1, !0) : !1;
            case 16:
                return !1 === gameBoardSprites[b][a].visible && !1 ===
                    gameBoardSprites[b + 1][a].visible && !1 === gameBoardSprites[b + 1][a + 1].visible && !1 === gameBoardSprites[b + 1][a + 2].visible ? (gameBoardShadow[b][a] = 1, gameBoardShadow[b + 1][a] = 1, gameBoardShadow[b + 1][a + 1] = 1, gameBoardShadow[b + 1][a + 2] = 1, !0) : !1;
            case 17:
                return !1 === gameBoardSprites[b][a].visible && !1 === gameBoardSprites[b][a + 1].visible && !1 === gameBoardSprites[b][a + 2].visible && !1 === gameBoardSprites[b + 1][a + 2].visible ? (gameBoardShadow[b][a] = 1, gameBoardShadow[b][a + 1] = 1, gameBoardShadow[b][a + 2] = 1, gameBoardShadow[b + 1][a + 2] =
                    1, !0) : !1;
            case 18:
                return !1 === gameBoardSprites[b][a].visible && !1 === gameBoardSprites[b][a + 1].visible && !1 === gameBoardSprites[b][a + 2].visible && !1 === gameBoardSprites[b + 1][a].visible ? (gameBoardShadow[b][a] = 1, gameBoardShadow[b][a + 1] = 1, gameBoardShadow[b][a + 2] = 1, gameBoardShadow[b + 1][a] = 1, !0) : !1;
            case 19:
                return !1 === gameBoardSprites[b + 1][a].visible && !1 === gameBoardSprites[b + 1][a + 1].visible && !1 === gameBoardSprites[b + 1][a + 2].visible && !1 === gameBoardSprites[b][a + 2].visible ? (gameBoardShadow[b + 1][a] = 1, gameBoardShadow[b +
                    1][a + 1] = 1, gameBoardShadow[b + 1][a + 2] = 1, gameBoardShadow[b][a + 2] = 1, !0) : !1;
            case 20:
                return !1 === gameBoardSprites[b][a].visible ? (gameBoardShadow[b][a] = 1, !0) : !1;
            case 21:
                return !1 === gameBoardSprites[b][a].visible && !1 === gameBoardSprites[b + 1][a].visible ? (gameBoardShadow[b][a] = 1, gameBoardShadow[b + 1][a] = 1, !0) : !1;
            case 22:
                return !1 === gameBoardSprites[b][a].visible && !1 === gameBoardSprites[b][a + 1].visible ? (gameBoardShadow[b][a] = 1, gameBoardShadow[b][a + 1] = 1, !0) : !1;
            case 23:
                return !1 === gameBoardSprites[b][a].visible && !1 ===
                    gameBoardSprites[b + 1][a].visible && !1 === gameBoardSprites[b + 2][a].visible ? (gameBoardShadow[b][a] = 1, gameBoardShadow[b + 1][a] = 1, gameBoardShadow[b + 2][a] = 1, !0) : !1;
            case 24:
                return !1 === gameBoardSprites[b][a].visible && !1 === gameBoardSprites[b][a + 1].visible && !1 === gameBoardSprites[b][a + 2].visible ? (gameBoardShadow[b][a] = 1, gameBoardShadow[b][a + 1] = 1, gameBoardShadow[b][a + 2] = 1, !0) : !1;
            case 25:
                return !1 === gameBoardSprites[b][a].visible && !1 === gameBoardSprites[b + 1][a].visible && !1 === gameBoardSprites[b + 2][a].visible && !1 ===
                    gameBoardSprites[b + 3][a].visible ? (gameBoardShadow[b][a] = 1, gameBoardShadow[b + 1][a] = 1, gameBoardShadow[b + 2][a] = 1, gameBoardShadow[b + 3][a] = 1, !0) : !1;
            case 26:
                return !1 === gameBoardSprites[b][a].visible && !1 === gameBoardSprites[b][a + 1].visible && !1 === gameBoardSprites[b][a + 2].visible && !1 === gameBoardSprites[b][a + 3].visible ? (gameBoardShadow[b][a] = 1, gameBoardShadow[b][a + 1] = 1, gameBoardShadow[b][a + 2] = 1, gameBoardShadow[b][a + 3] = 1, !0) : !1;
            case 27:
                return !1 === gameBoardSprites[b][a].visible && !1 === gameBoardSprites[b + 1][a].visible &&
                    !1 === gameBoardSprites[b + 2][a].visible && !1 === gameBoardSprites[b + 3][a].visible && !1 === gameBoardSprites[b + 4][a].visible ? (gameBoardShadow[b][a] = 1, gameBoardShadow[b + 1][a] = 1, gameBoardShadow[b + 2][a] = 1, gameBoardShadow[b + 3][a] = 1, gameBoardShadow[b + 4][a] = 1, !0) : !1;
            case 28:
                return !1 === gameBoardSprites[b][a].visible && !1 === gameBoardSprites[b][a + 1].visible && !1 === gameBoardSprites[b][a + 2].visible && !1 === gameBoardSprites[b][a + 3].visible && !1 === gameBoardSprites[b][a + 4].visible ? (gameBoardShadow[b][a] = 1, gameBoardShadow[b][a +
                    1
                ] = 1, gameBoardShadow[b][a + 2] = 1, gameBoardShadow[b][a + 3] = 1, gameBoardShadow[b][a + 4] = 1, !0) : !1;
            case 29:
                return !1 === gameBoardSprites[b][a + 1].visible && !1 === gameBoardSprites[b + 1][a].visible && !1 === gameBoardSprites[b + 1][a + 1].visible && !1 === gameBoardSprites[b + 1][a + 2].visible ? (gameBoardShadow[b][a + 1] = 1, gameBoardShadow[b + 1][a] = 1, gameBoardShadow[b + 1][a + 1] = 1, gameBoardShadow[b + 1][a + 2] = 1, !0) : !1;
            case 30:
                return !1 === gameBoardSprites[b][a].visible && !1 === gameBoardSprites[b + 1][a].visible && !1 === gameBoardSprites[b + 1][a + 1].visible &&
                    !1 === gameBoardSprites[b + 2][a].visible ? (gameBoardShadow[b][a] = 1, gameBoardShadow[b + 1][a] = 1, gameBoardShadow[b + 1][a + 1] = 1, gameBoardShadow[b + 2][a] = 1, !0) : !1;
            case 31:
                return !1 === gameBoardSprites[b + 1][a + 1].visible && !1 === gameBoardSprites[b][a].visible && !1 === gameBoardSprites[b][a + 1].visible && !1 === gameBoardSprites[b][a + 2].visible ? (gameBoardShadow[b + 1][a + 1] = 1, gameBoardShadow[b][a] = 1, gameBoardShadow[b][a + 1] = 1, gameBoardShadow[b][a + 2] = 1, !0) : !1;
            case 32:
                return !1 === gameBoardSprites[b][a + 1].visible && !1 === gameBoardSprites[b +
                    1][a + 1].visible && !1 === gameBoardSprites[b + 2][a + 1].visible && !1 === gameBoardSprites[b + 1][a].visible ? (gameBoardShadow[b][a + 1] = 1, gameBoardShadow[b + 1][a + 1] = 1, gameBoardShadow[b + 2][a + 1] = 1, gameBoardShadow[b + 1][a] = 1, !0) : !1;
            case 33:
                return !1 === gameBoardSprites[b][a + 1].visible && !1 === gameBoardSprites[b][a + 2].visible && !1 === gameBoardSprites[b + 1][a + 1].visible && !1 === gameBoardSprites[b + 1][a].visible ? (gameBoardShadow[b][a + 1] = 1, gameBoardShadow[b][a + 2] = 1, gameBoardShadow[b + 1][a] = 1, gameBoardShadow[b + 1][a + 1] = 1, !0) : !1;
            case 34:
                return !1 ===
                    gameBoardSprites[b][a].visible && !1 === gameBoardSprites[b + 1][a].visible && !1 === gameBoardSprites[b + 1][a + 1].visible && !1 === gameBoardSprites[b + 2][a + 1].visible ? (gameBoardShadow[b][a] = 1, gameBoardShadow[b + 1][a] = 1, gameBoardShadow[b + 1][a + 1] = 1, gameBoardShadow[b + 2][a + 1] = 1, !0) : !1;
            case 35:
                return !1 === gameBoardSprites[b + 1][a].visible && !1 === gameBoardSprites[b + 1][a + 1].visible && !1 === gameBoardSprites[b + 1][a + 2].visible && !1 === gameBoardSprites[b][a + 1].visible && !1 === gameBoardSprites[b + 2][a + 1].visible ? (gameBoardShadow[b + 1][a] =
                    1, gameBoardShadow[b + 1][a + 1] = 1, gameBoardShadow[b + 1][a + 2] = 1, gameBoardShadow[b][a + 1] = 1, gameBoardShadow[b + 2][a + 1] = 1, !0) : !1
        }
    },
    gameBoardHistoryUpdate: function() {
        for (var b = 0; b < BOARD_SIZE; b++)
            for (var a = 0; a < BOARD_SIZE; a++) gameBoardHistory[b][a].exist = gameBoardSprites[b][a].visible
    },
    storeToGameBoard: function(b, a, c) {
        var e = c.data[1],
            d;
        switch (c.data[0]) {
            case 0:
                if (!1 === gameBoardSprites[b][a].visible && !1 === gameBoardSprites[b][a + 1].visible && !1 === gameBoardSprites[b + 1][a + 2].visible && !1 === gameBoardSprites[b + 1][a + 1].visible) return this.logGameBoard(),
                    this.gameBoardHistoryUpdate(), d = gameBoardSprites[b][a], d.loadTexture("tiles", c.data[1]), d.data[1] = e, d.visible = !0, d = gameBoardSprites[b][a + 1], d.loadTexture("tiles", c.data[1]), d.data[1] = e, d.visible = !0, d = gameBoardSprites[b + 1][a + 2], d.loadTexture("tiles", c.data[1]), d.data[1] = e, d.visible = !0, d = gameBoardSprites[b + 1][a + 1], d.loadTexture("tiles", c.data[1]), d.data[1] = e, d.visible = !0, c.visible = !1, !0;
                break;
            case 1:
                if (!1 === gameBoardSprites[b][a + 1].visible && !1 === gameBoardSprites[b + 1][a + 1].visible && !1 === gameBoardSprites[b +
                        1][a].visible && !1 === gameBoardSprites[b + 2][a].visible) return this.logGameBoard(), this.gameBoardHistoryUpdate(), d = gameBoardSprites[b][a + 1], d.loadTexture("tiles", c.data[1]), d.data[1] = e, d.visible = !0, d = gameBoardSprites[b + 1][a + 1], d.loadTexture("tiles", c.data[1]), d.data[1] = e, d.visible = !0, d = gameBoardSprites[b + 1][a], d.loadTexture("tiles", c.data[1]), d.data[1] = e, d.visible = !0, d = gameBoardSprites[b + 2][a], d.loadTexture("tiles", c.data[1]), d.data[1] = e, d.visible = !0, c.visible = !1, !0;
                break;
            case 2:
                if (!1 === gameBoardSprites[b][a].visible &&
                    !1 === gameBoardSprites[b][a + 1].visible && !1 === gameBoardSprites[b][a + 2].visible && !1 === gameBoardSprites[b + 1][a].visible && !1 === gameBoardSprites[b + 1][a + 1].visible && !1 === gameBoardSprites[b + 1][a + 2].visible && !1 === gameBoardSprites[b + 2][a].visible && !1 === gameBoardSprites[b + 2][a + 1].visible && !1 === gameBoardSprites[b + 2][a + 2].visible) {
                    this.logGameBoard();
                    this.gameBoardHistoryUpdate();
                    for (var f = 0; 3 > f; f++)
                        for (var g = 0; 3 > g; g++) d = gameBoardSprites[b + g][a + f], d.loadTexture("tiles", c.data[1]), d.data[1] = e, d.visible = !0;
                    c.visible = !1;
                    return !0
                }
                break;
            case 3:
                if (!1 === gameBoardSprites[b][a].visible && !1 === gameBoardSprites[b][a + 1].visible && !1 === gameBoardSprites[b + 1][a].visible && !1 === gameBoardSprites[b + 1][a + 1].visible) {
                    this.logGameBoard();
                    this.gameBoardHistoryUpdate();
                    for (f = 0; 2 > f; f++)
                        for (g = 0; 2 > g; g++) d = gameBoardSprites[b + g][a + f], d.loadTexture("tiles", c.data[1]), d.data[1] = e, d.visible = !0;
                    c.visible = !1;
                    return !0
                }
                break;
            case 4:
                if (!1 === gameBoardSprites[b][a].visible && !1 === gameBoardSprites[b + 1][a].visible && !1 === gameBoardSprites[b + 2][a].visible &&
                    !1 === gameBoardSprites[b + 2][a + 1].visible && !1 === gameBoardSprites[b + 2][a + 2].visible) return this.logGameBoard(), this.gameBoardHistoryUpdate(), d = gameBoardSprites[b][a], d.loadTexture("tiles", c.data[1]), d.data[1] = e, d.visible = !0, d = gameBoardSprites[b + 1][a], d.loadTexture("tiles", c.data[1]), d.data[1] = e, d.visible = !0, d = gameBoardSprites[b + 2][a], d.loadTexture("tiles", c.data[1]), d.data[1] = e, d.visible = !0, d = gameBoardSprites[b + 2][a + 1], d.loadTexture("tiles", c.data[1]), d.data[1] = e, d.visible = !0, d = gameBoardSprites[b + 2][a +
                    2
                ], d.loadTexture("tiles", c.data[1]), d.data[1] = e, d.visible = !0, c.visible = !1, !0;
                break;
            case 5:
                if (!1 === gameBoardSprites[b][a + 2].visible && !1 === gameBoardSprites[b + 1][a + 2].visible && !1 === gameBoardSprites[b + 2][a + 2].visible && !1 === gameBoardSprites[b + 2][a + 1].visible && !1 === gameBoardSprites[b + 2][a].visible) return this.logGameBoard(), this.gameBoardHistoryUpdate(), d = gameBoardSprites[b][a + 2], d.loadTexture("tiles", c.data[1]), d.data[1] = e, d.visible = !0, d = gameBoardSprites[b + 1][a + 2], d.loadTexture("tiles", c.data[1]), d.data[1] =
                    e, d.visible = !0, d = gameBoardSprites[b + 2][a + 2], d.loadTexture("tiles", c.data[1]), d.data[1] = e, d.visible = !0, d = gameBoardSprites[b + 2][a + 1], d.loadTexture("tiles", c.data[1]), d.data[1] = e, d.visible = !0, d = gameBoardSprites[b + 2][a], d.loadTexture("tiles", c.data[1]), d.data[1] = e, d.visible = !0, c.visible = !1, !0;
                break;
            case 6:
                if (!1 === gameBoardSprites[b][a].visible && !1 === gameBoardSprites[b + 1][a].visible && !1 === gameBoardSprites[b + 2][a].visible && !1 === gameBoardSprites[b][a + 1].visible && !1 === gameBoardSprites[b][a + 2].visible) return this.logGameBoard(),
                    this.gameBoardHistoryUpdate(), d = gameBoardSprites[b][a], d.loadTexture("tiles", c.data[1]), d.data[1] = e, d.visible = !0, d = gameBoardSprites[b + 1][a], d.loadTexture("tiles", c.data[1]), d.data[1] = e, d.visible = !0, d = gameBoardSprites[b + 2][a], d.loadTexture("tiles", c.data[1]), d.data[1] = e, d.visible = !0, d = gameBoardSprites[b][a + 1], d.loadTexture("tiles", c.data[1]), d.data[1] = e, d.visible = !0, d = gameBoardSprites[b][a + 2], d.loadTexture("tiles", c.data[1]), d.data[1] = e, d.visible = !0, c.visible = !1, !0;
                break;
            case 7:
                if (!1 === gameBoardSprites[b][a].visible &&
                    !1 === gameBoardSprites[b][a + 1].visible && !1 === gameBoardSprites[b][a + 2].visible && !1 === gameBoardSprites[b + 1][a + 2].visible && !1 === gameBoardSprites[b + 2][a + 2].visible) return this.logGameBoard(), this.gameBoardHistoryUpdate(), d = gameBoardSprites[b][a], d.loadTexture("tiles", c.data[1]), d.data[1] = e, d.visible = !0, d = gameBoardSprites[b][a + 1], d.loadTexture("tiles", c.data[1]), d.data[1] = e, d.visible = !0, d = gameBoardSprites[b][a + 2], d.loadTexture("tiles", c.data[1]), d.data[1] = e, d.visible = !0, d = gameBoardSprites[b + 1][a + 2], d.loadTexture("tiles",
                    c.data[1]), d.data[1] = e, d.visible = !0, d = gameBoardSprites[b + 2][a + 2], d.loadTexture("tiles", c.data[1]), d.data[1] = e, d.visible = !0, c.visible = !1, !0;
                break;
            case 8:
                if (!1 === gameBoardSprites[b][a].visible && !1 === gameBoardSprites[b + 1][a].visible && !1 === gameBoardSprites[b + 1][a + 1].visible) return this.logGameBoard(), this.gameBoardHistoryUpdate(), d = gameBoardSprites[b][a], d.loadTexture("tiles", c.data[1]), d.data[1] = e, d.visible = !0, d = gameBoardSprites[b + 1][a], d.loadTexture("tiles", c.data[1]), d.data[1] = e, d.visible = !0, d = gameBoardSprites[b +
                    1][a + 1], d.loadTexture("tiles", c.data[1]), d.data[1] = e, d.visible = !0, c.visible = !1, !0;
                break;
            case 9:
                if (!1 === gameBoardSprites[b][a + 1].visible && !1 === gameBoardSprites[b + 1][a].visible && !1 === gameBoardSprites[b + 1][a + 1].visible) return this.logGameBoard(), this.gameBoardHistoryUpdate(), d = gameBoardSprites[b][a + 1], d.loadTexture("tiles", c.data[1]), d.data[1] = e, d.visible = !0, d = gameBoardSprites[b + 1][a], d.loadTexture("tiles", c.data[1]), d.data[1] = e, d.visible = !0, d = gameBoardSprites[b + 1][a + 1], d.loadTexture("tiles", c.data[1]),
                    d.data[1] = e, d.visible = !0, c.visible = !1, !0;
                break;
            case 10:
                if (!1 === gameBoardSprites[b][a].visible && !1 === gameBoardSprites[b + 1][a].visible && !1 === gameBoardSprites[b][a + 1].visible) return this.logGameBoard(), this.gameBoardHistoryUpdate(), d = gameBoardSprites[b][a], d.loadTexture("tiles", c.data[1]), d.data[1] = e, d.visible = !0, d = gameBoardSprites[b + 1][a], d.loadTexture("tiles", c.data[1]), d.data[1] = e, d.visible = !0, d = gameBoardSprites[b][a + 1], d.loadTexture("tiles", c.data[1]), d.data[1] = e, d.visible = !0, c.visible = !1, !0;
                break;
            case 11:
                if (!1 === gameBoardSprites[b][a + 1].visible && !1 === gameBoardSprites[b][a].visible && !1 === gameBoardSprites[b + 1][a + 1].visible) return this.logGameBoard(), this.gameBoardHistoryUpdate(), d = gameBoardSprites[b][a + 1], d.loadTexture("tiles", c.data[1]), d.data[1] = e, d.visible = !0, d = gameBoardSprites[b][a], d.loadTexture("tiles", c.data[1]), d.data[1] = e, d.visible = !0, d = gameBoardSprites[b + 1][a + 1], d.loadTexture("tiles", c.data[1]), d.data[1] = e, d.visible = !0, c.visible = !1, !0;
                break;
            case 12:
                if (!1 === gameBoardSprites[b][a].visible &&
                    !1 === gameBoardSprites[b + 1][a].visible && !1 === gameBoardSprites[b + 2][a].visible && !1 === gameBoardSprites[b + 2][a + 1].visible) return this.logGameBoard(), this.gameBoardHistoryUpdate(), d = gameBoardSprites[b][a], d.loadTexture("tiles", c.data[1]), d.data[1] = e, d.visible = !0, d = gameBoardSprites[b + 1][a], d.loadTexture("tiles", c.data[1]), d.data[1] = e, d.visible = !0, d = gameBoardSprites[b + 2][a], d.loadTexture("tiles", c.data[1]), d.data[1] = e, d.visible = !0, d = gameBoardSprites[b + 2][a + 1], d.loadTexture("tiles", c.data[1]), d.data[1] = e,
                    d.visible = !0, c.visible = !1, !0;
                break;
            case 13:
                if (!1 === gameBoardSprites[b][a + 1].visible && !1 === gameBoardSprites[b + 1][a + 1].visible && !1 === gameBoardSprites[b + 2][a].visible && !1 === gameBoardSprites[b + 2][a + 1].visible) return this.logGameBoard(), this.gameBoardHistoryUpdate(), d = gameBoardSprites[b][a + 1], d.loadTexture("tiles", c.data[1]), d.data[1] = e, d.visible = !0, d = gameBoardSprites[b + 1][a + 1], d.loadTexture("tiles", c.data[1]), d.data[1] = e, d.visible = !0, d = gameBoardSprites[b + 2][a], d.loadTexture("tiles", c.data[1]), d.data[1] =
                    e, d.visible = !0, d = gameBoardSprites[b + 2][a + 1], d.loadTexture("tiles", c.data[1]), d.data[1] = e, d.visible = !0, c.visible = !1, !0;
                break;
            case 14:
                if (!1 === gameBoardSprites[b][a].visible && !1 === gameBoardSprites[b + 1][a].visible && !1 === gameBoardSprites[b + 2][a].visible && !1 === gameBoardSprites[b][a + 1].visible) return this.logGameBoard(), this.gameBoardHistoryUpdate(), d = gameBoardSprites[b][a], d.loadTexture("tiles", c.data[1]), d.data[1] = e, d.visible = !0, d = gameBoardSprites[b + 1][a], d.loadTexture("tiles", c.data[1]), d.data[1] = e, d.visible = !0, d = gameBoardSprites[b + 2][a], d.loadTexture("tiles", c.data[1]), d.data[1] = e, d.visible = !0, d = gameBoardSprites[b][a + 1], d.loadTexture("tiles", c.data[1]), d.data[1] = e, d.visible = !0, c.visible = !1, !0;
                break;
            case 15:
                if (!1 === gameBoardSprites[b][a].visible && !1 === gameBoardSprites[b][a + 1].visible && !1 === gameBoardSprites[b + 1][a + 1].visible && !1 === gameBoardSprites[b + 2][a + 1].visible) return this.logGameBoard(), this.gameBoardHistoryUpdate(), d = gameBoardSprites[b][a + 1], d.loadTexture("tiles", c.data[1]), d.data[1] = e, d.visible = !0, d = gameBoardSprites[b + 1][a + 1], d.loadTexture("tiles", c.data[1]), d.data[1] = e, d.visible = !0, d = gameBoardSprites[b + 2][a + 1], d.loadTexture("tiles", c.data[1]), d.data[1] = e, d.visible = !0, d = gameBoardSprites[b][a], d.loadTexture("tiles", c.data[1]), d.data[1] = e, d.visible = !0, c.visible = !1, !0;
                break;
            case 16:
                if (!1 === gameBoardSprites[b][a].visible && !1 === gameBoardSprites[b + 1][a].visible && !1 === gameBoardSprites[b + 1][a + 1].visible && !1 === gameBoardSprites[b + 1][a + 2].visible) return this.logGameBoard(), this.gameBoardHistoryUpdate(),
                    d = gameBoardSprites[b][a], d.loadTexture("tiles", c.data[1]), d.data[1] = e, d.visible = !0, d = gameBoardSprites[b + 1][a], d.loadTexture("tiles", c.data[1]), d.data[1] = e, d.visible = !0, d = gameBoardSprites[b + 1][a + 1], d.loadTexture("tiles", c.data[1]), d.data[1] = e, d.visible = !0, d = gameBoardSprites[b + 1][a + 2], d.loadTexture("tiles", c.data[1]), d.data[1] = e, d.visible = !0, c.visible = !1, !0;
                break;
            case 17:
                if (!1 === gameBoardSprites[b][a].visible && !1 === gameBoardSprites[b][a + 1].visible && !1 === gameBoardSprites[b][a + 2].visible && !1 === gameBoardSprites[b +
                        1][a + 2].visible) return this.logGameBoard(), this.gameBoardHistoryUpdate(), d = gameBoardSprites[b][a], d.loadTexture("tiles", c.data[1]), d.data[1] = e, d.visible = !0, d = gameBoardSprites[b][a + 1], d.loadTexture("tiles", c.data[1]), d.data[1] = e, d.visible = !0, d = gameBoardSprites[b][a + 2], d.loadTexture("tiles", c.data[1]), d.data[1] = e, d.visible = !0, d = gameBoardSprites[b + 1][a + 2], d.loadTexture("tiles", c.data[1]), d.data[1] = e, d.visible = !0, c.visible = !1, !0;
                break;
            case 18:
                if (!1 === gameBoardSprites[b][a].visible && !1 === gameBoardSprites[b][a +
                        1
                    ].visible && !1 === gameBoardSprites[b][a + 2].visible && !1 === gameBoardSprites[b + 1][a].visible) return this.logGameBoard(), this.gameBoardHistoryUpdate(), d = gameBoardSprites[b][a], d.loadTexture("tiles", c.data[1]), d.data[1] = e, d.visible = !0, d = gameBoardSprites[b][a + 1], d.loadTexture("tiles", c.data[1]), d.data[1] = e, d.visible = !0, d = gameBoardSprites[b][a + 2], d.loadTexture("tiles", c.data[1]), d.data[1] = e, d.visible = !0, d = gameBoardSprites[b + 1][a], d.loadTexture("tiles", c.data[1]), d.data[1] = e, d.visible = !0, c.visible = !1, !0;
                break;
            case 19:
                if (!1 === gameBoardSprites[b + 1][a].visible && !1 === gameBoardSprites[b + 1][a + 1].visible && !1 === gameBoardSprites[b + 1][a + 2].visible && !1 === gameBoardSprites[b][a + 2].visible) return this.logGameBoard(), this.gameBoardHistoryUpdate(), d = gameBoardSprites[b + 1][a], d.loadTexture("tiles", c.data[1]), d.data[1] = e, d.visible = !0, d = gameBoardSprites[b + 1][a + 1], d.loadTexture("tiles", c.data[1]), d.data[1] = e, d.visible = !0, d = gameBoardSprites[b + 1][a + 2], d.loadTexture("tiles", c.data[1]), d.data[1] = e, d.visible = !0, d = gameBoardSprites[b][a +
                    2
                ], d.loadTexture("tiles", c.data[1]), d.data[1] = e, d.visible = !0, c.visible = !1, !0;
                break;
            case 20:
                if (!1 === gameBoardSprites[b][a].visible) return this.logGameBoard(), this.gameBoardHistoryUpdate(), d = gameBoardSprites[b][a], d.loadTexture("tiles", c.data[1]), d.data[1] = e, d.visible = !0, c.visible = !1, !0;
                break;
            case 21:
                if (!1 === gameBoardSprites[b][a].visible && !1 === gameBoardSprites[b + 1][a].visible) return this.logGameBoard(), this.gameBoardHistoryUpdate(), d = gameBoardSprites[b][a], d.loadTexture("tiles", c.data[1]), d.data[1] =
                    e, d.visible = !0, d = gameBoardSprites[b + 1][a], d.loadTexture("tiles", c.data[1]), d.data[1] = e, d.visible = !0, c.visible = !1, !0;
                break;
            case 22:
                if (!1 === gameBoardSprites[b][a].visible && !1 === gameBoardSprites[b][a + 1].visible) return this.logGameBoard(), this.gameBoardHistoryUpdate(), d = gameBoardSprites[b][a], d.loadTexture("tiles", c.data[1]), d.data[1] = e, d.visible = !0, d = gameBoardSprites[b][a + 1], d.loadTexture("tiles", c.data[1]), d.data[1] = e, d.visible = !0, c.visible = !1, !0;
                break;
            case 23:
                if (!1 === gameBoardSprites[b][a].visible &&
                    !1 === gameBoardSprites[b + 1][a].visible && !1 === gameBoardSprites[b + 2][a].visible) return this.logGameBoard(), this.gameBoardHistoryUpdate(), d = gameBoardSprites[b][a], d.loadTexture("tiles", c.data[1]), d.data[1] = e, d.visible = !0, d = gameBoardSprites[b + 1][a], d.loadTexture("tiles", c.data[1]), d.data[1] = e, d.visible = !0, d = gameBoardSprites[b + 2][a], d.loadTexture("tiles", c.data[1]), d.data[1] = e, d.visible = !0, c.visible = !1, !0;
                break;
            case 24:
                if (!1 === gameBoardSprites[b][a].visible && !1 === gameBoardSprites[b][a + 1].visible && !1 ===
                    gameBoardSprites[b][a + 2].visible) return this.logGameBoard(), this.gameBoardHistoryUpdate(), d = gameBoardSprites[b][a], d.loadTexture("tiles", c.data[1]), d.data[1] = e, d.visible = !0, d = gameBoardSprites[b][a + 1], d.loadTexture("tiles", c.data[1]), d.data[1] = e, d.visible = !0, d = gameBoardSprites[b][a + 2], d.loadTexture("tiles", c.data[1]), d.data[1] = e, d.visible = !0, c.visible = !1, !0;
                break;
            case 25:
                if (!1 === gameBoardSprites[b][a].visible && !1 === gameBoardSprites[b + 1][a].visible && !1 === gameBoardSprites[b + 2][a].visible && !1 === gameBoardSprites[b +
                        3][a].visible) return this.logGameBoard(), this.gameBoardHistoryUpdate(), d = gameBoardSprites[b][a], d.loadTexture("tiles", c.data[1]), d.data[1] = e, d.visible = !0, d = gameBoardSprites[b + 1][a], d.loadTexture("tiles", c.data[1]), d.data[1] = e, d.visible = !0, d = gameBoardSprites[b + 2][a], d.loadTexture("tiles", c.data[1]), d.data[1] = e, d.visible = !0, d = gameBoardSprites[b + 3][a], d.loadTexture("tiles", c.data[1]), d.data[1] = e, d.visible = !0, c.visible = !1, !0;
                break;
            case 26:
                if (!1 === gameBoardSprites[b][a].visible && !1 === gameBoardSprites[b][a +
                        1
                    ].visible && !1 === gameBoardSprites[b][a + 2].visible && !1 === gameBoardSprites[b][a + 3].visible) return this.logGameBoard(), this.gameBoardHistoryUpdate(), d = gameBoardSprites[b][a], d.loadTexture("tiles", c.data[1]), d.data[1] = e, d.visible = !0, d = gameBoardSprites[b][a + 1], d.loadTexture("tiles", c.data[1]), d.data[1] = e, d.visible = !0, d = gameBoardSprites[b][a + 2], d.loadTexture("tiles", c.data[1]), d.data[1] = e, d.visible = !0, d = gameBoardSprites[b][a + 3], d.loadTexture("tiles", c.data[1]), d.data[1] = e, d.visible = !0, c.visible = !1, !0;
                break;
            case 27:
                if (!1 === gameBoardSprites[b][a].visible && !1 === gameBoardSprites[b + 1][a].visible && !1 === gameBoardSprites[b + 2][a].visible && !1 === gameBoardSprites[b + 3][a].visible && !1 === gameBoardSprites[b + 4][a].visible) return this.logGameBoard(), this.gameBoardHistoryUpdate(), d = gameBoardSprites[b][a], d.loadTexture("tiles", c.data[1]), d.data[1] = e, d.visible = !0, d = gameBoardSprites[b + 1][a], d.loadTexture("tiles", c.data[1]), d.data[1] = e, d.visible = !0, d = gameBoardSprites[b + 2][a], d.loadTexture("tiles", c.data[1]), d.data[1] = e, d.visible = !0, d = gameBoardSprites[b + 3][a], d.loadTexture("tiles", c.data[1]), d.data[1] = e, d.visible = !0, d = gameBoardSprites[b + 4][a], d.loadTexture("tiles", c.data[1]), d.data[1] = e, d.visible = !0, c.visible = !1, !0;
                break;
            case 28:
                if (!1 === gameBoardSprites[b][a].visible && !1 === gameBoardSprites[b][a + 1].visible && !1 === gameBoardSprites[b][a + 2].visible && !1 === gameBoardSprites[b][a + 3].visible && !1 === gameBoardSprites[b][a + 4].visible) return this.logGameBoard(), this.gameBoardHistoryUpdate(), d = gameBoardSprites[b][a], d.loadTexture("tiles",
                    c.data[1]), d.data[1] = e, d.visible = !0, d = gameBoardSprites[b][a + 1], d.loadTexture("tiles", c.data[1]), d.data[1] = e, d.visible = !0, d = gameBoardSprites[b][a + 2], d.loadTexture("tiles", c.data[1]), d.data[1] = e, d.visible = !0, d = gameBoardSprites[b][a + 3], d.loadTexture("tiles", c.data[1]), d.data[1] = e, d.visible = !0, d = gameBoardSprites[b][a + 4], d.loadTexture("tiles", c.data[1]), d.data[1] = e, d.visible = !0, c.visible = !1, !0;
                break;
            case 29:
                if (!1 === gameBoardSprites[b][a + 1].visible && !1 === gameBoardSprites[b + 1][a].visible && !1 === gameBoardSprites[b +
                        1][a + 1].visible && !1 === gameBoardSprites[b + 1][a + 2].visible) return this.logGameBoard(), this.gameBoardHistoryUpdate(), d = gameBoardSprites[b][a + 1], d.loadTexture("tiles", c.data[1]), d.data[1] = e, d.visible = !0, d = gameBoardSprites[b + 1][a], d.loadTexture("tiles", c.data[1]), d.data[1] = e, d.visible = !0, d = gameBoardSprites[b + 1][a + 1], d.loadTexture("tiles", c.data[1]), d.data[1] = e, d.visible = !0, d = gameBoardSprites[b + 1][a + 2], d.loadTexture("tiles", c.data[1]), d.data[1] = e, d.visible = !0, c.visible = !1, !0;
                break;
            case 30:
                if (!1 === gameBoardSprites[b][a].visible &&
                    !1 === gameBoardSprites[b + 1][a].visible && !1 === gameBoardSprites[b + 1][a + 1].visible && !1 === gameBoardSprites[b + 2][a].visible) return this.logGameBoard(), this.gameBoardHistoryUpdate(), d = gameBoardSprites[b][a], d.loadTexture("tiles", c.data[1]), d.data[1] = e, d.visible = !0, d = gameBoardSprites[b + 1][a], d.loadTexture("tiles", c.data[1]), d.data[1] = e, d.visible = !0, d = gameBoardSprites[b + 1][a + 1], d.loadTexture("tiles", c.data[1]), d.data[1] = e, d.visible = !0, d = gameBoardSprites[b + 2][a], d.loadTexture("tiles", c.data[1]), d.data[1] = e,
                    d.visible = !0, c.visible = !1, !0;
                break;
            case 31:
                if (!1 === gameBoardSprites[b + 1][a + 1].visible && !1 === gameBoardSprites[b][a].visible && !1 === gameBoardSprites[b][a + 1].visible && !1 === gameBoardSprites[b][a + 2].visible) return this.logGameBoard(), this.gameBoardHistoryUpdate(), d = gameBoardSprites[b][a], d.loadTexture("tiles", c.data[1]), d.data[1] = e, d.visible = !0, d = gameBoardSprites[b + 1][a + 1], d.loadTexture("tiles", c.data[1]), d.data[1] = e, d.visible = !0, d = gameBoardSprites[b][a + 1], d.loadTexture("tiles", c.data[1]), d.data[1] = e, d.visible = !0, d = gameBoardSprites[b][a + 2], d.loadTexture("tiles", c.data[1]), d.data[1] = e, d.visible = !0, c.visible = !1, !0;
                break;
            case 32:
                if (!1 === gameBoardSprites[b][a + 1].visible && !1 === gameBoardSprites[b + 1][a + 1].visible && !1 === gameBoardSprites[b + 2][a + 1].visible && !1 === gameBoardSprites[b + 1][a].visible) return this.logGameBoard(), this.gameBoardHistoryUpdate(), d = gameBoardSprites[b][a + 1], d.loadTexture("tiles", c.data[1]), d.data[1] = e, d.visible = !0, d = gameBoardSprites[b + 1][a + 1], d.loadTexture("tiles", c.data[1]), d.data[1] = e, d.visible = !0, d = gameBoardSprites[b + 2][a + 1], d.loadTexture("tiles", c.data[1]), d.data[1] = e, d.visible = !0, d = gameBoardSprites[b + 1][a], d.loadTexture("tiles", c.data[1]), d.data[1] = e, d.visible = !0, c.visible = !1, !0;
                break;
            case 33:
                if (!1 === gameBoardSprites[b][a + 1].visible && !1 === gameBoardSprites[b][a + 2].visible && !1 === gameBoardSprites[b + 1][a + 1].visible && !1 === gameBoardSprites[b + 1][a].visible) return this.logGameBoard(), this.gameBoardHistoryUpdate(), d = gameBoardSprites[b][a + 1], d.loadTexture("tiles", c.data[1]), d.data[1] = e, d.visible = !0, d = gameBoardSprites[b][a + 2], d.loadTexture("tiles", c.data[1]), d.data[1] = e, d.visible = !0, d = gameBoardSprites[b + 1][a + 1], d.loadTexture("tiles", c.data[1]), d.data[1] = e, d.visible = !0, d = gameBoardSprites[b + 1][a], d.loadTexture("tiles", c.data[1]), d.data[1] = e, d.visible = !0, c.visible = !1, !0;
                break;
            case 34:
                if (!1 === gameBoardSprites[b][a].visible && !1 === gameBoardSprites[b + 1][a].visible && !1 === gameBoardSprites[b + 1][a + 1].visible && !1 === gameBoardSprites[b + 2][a + 1].visible) return this.logGameBoard(), this.gameBoardHistoryUpdate(),
                    d = gameBoardSprites[b][a], d.loadTexture("tiles", c.data[1]), d.data[1] = e, d.visible = !0, d = gameBoardSprites[b + 1][a], d.loadTexture("tiles", c.data[1]), d.data[1] = e, d.visible = !0, d = gameBoardSprites[b + 1][a + 1], d.loadTexture("tiles", c.data[1]), d.data[1] = e, d.visible = !0, d = gameBoardSprites[b + 2][a + 1], d.loadTexture("tiles", c.data[1]), d.data[1] = e, d.visible = !0, c.visible = !1, !0;
                break;
            case 35:
                if (!1 === gameBoardSprites[b + 1][a].visible && !1 === gameBoardSprites[b + 1][a + 1].visible && !1 === gameBoardSprites[b + 1][a + 2].visible && !1 ===
                    gameBoardSprites[b][a + 1].visible && !1 === gameBoardSprites[b + 2][a + 1].visible) return this.logGameBoard(), this.gameBoardHistoryUpdate(), d = gameBoardSprites[b + 1][a], d.loadTexture("tiles", c.data[1]), d.data[1] = e, d.visible = !0, d = gameBoardSprites[b + 1][a + 1], d.loadTexture("tiles", c.data[1]), d.data[1] = e, d.visible = !0, d = gameBoardSprites[b + 1][a + 2], d.loadTexture("tiles", c.data[1]), d.data[1] = e, d.visible = !0, d = gameBoardSprites[b][a + 1], d.loadTexture("tiles", c.data[1]), d.data[1] = e, d.visible = !0, d = gameBoardSprites[b + 2][a +
                    1
                ], d.loadTexture("tiles", c.data[1]), d.data[1] = e, d.visible = !0, c.visible = !1, !0
        }
        return !1
    },
    createSmallBlock: function(b, a, c, e) {
        var d;
        switch (b) {
            case 0:
                d = game.add.bitmapData(60, 40);
                d.draw(game.make.image(0, 0, c, a), 0, 0);
                d.draw(game.make.image(0, 0, c, a), 20, 0);
                d.draw(game.make.image(0, 0, c, a), 20, 20);
                d.draw(game.make.image(0, 0, c, a), 40, 20);
                break;
            case 1:
                d = game.add.bitmapData(40, 60);
                d.draw(game.make.image(0, 0, c, a), 20, 0);
                d.draw(game.make.image(0, 0, c, a), 20, 20);
                d.draw(game.make.image(0, 0, c, a), 0, 20);
                d.draw(game.make.image(0,
                    0, c, a), 0, 40);
                break;
            case 2:
                d = game.add.bitmapData(60, 60);
                for (b = 0; 3 > b; b++)
                    for (var f = 0; 3 > f; f++) d.draw(game.make.image(0, 0, c, a), 20 * b, 20 * f);
                break;
            case 3:
                d = game.add.bitmapData(40, 40);
                for (b = 0; 2 > b; b++)
                    for (f = 0; 2 > f; f++) d.draw(game.make.image(0, 0, c, a), 20 * b, 20 * f);
                break;
            case 4:
                d = game.add.bitmapData(60, 60);
                d.draw(game.make.image(0, 0, c, a), 0, 0);
                d.draw(game.make.image(0, 0, c, a), 0, 20);
                d.draw(game.make.image(0, 0, c, a), 0, 40);
                d.draw(game.make.image(0, 0, c, a), 20, 40);
                d.draw(game.make.image(0, 0, c, a), 40, 40);
                break;
            case 5:
                d = game.add.bitmapData(60,
                    60);
                d.draw(game.make.image(0, 0, c, a), 40, 0);
                d.draw(game.make.image(0, 0, c, a), 40, 20);
                d.draw(game.make.image(0, 0, c, a), 40, 40);
                d.draw(game.make.image(0, 0, c, a), 20, 40);
                d.draw(game.make.image(0, 0, c, a), 0, 40);
                break;
            case 6:
                d = game.add.bitmapData(60, 60);
                d.draw(game.make.image(0, 0, c, a), 0, 0);
                d.draw(game.make.image(0, 0, c, a), 20, 0);
                d.draw(game.make.image(0, 0, c, a), 40, 0);
                d.draw(game.make.image(0, 0, c, a), 0, 20);
                d.draw(game.make.image(0, 0, c, a), 0, 40);
                break;
            case 7:
                d = game.add.bitmapData(60, 60);
                d.draw(game.make.image(0, 0, c, a),
                    0, 0);
                d.draw(game.make.image(0, 0, c, a), 20, 0);
                d.draw(game.make.image(0, 0, c, a), 40, 0);
                d.draw(game.make.image(0, 0, c, a), 40, 20);
                d.draw(game.make.image(0, 0, c, a), 40, 40);
                break;
            case 8:
                d = game.add.bitmapData(40, 40);
                d.draw(game.make.image(0, 0, c, a), 0, 0);
                d.draw(game.make.image(0, 0, c, a), 0, 20);
                d.draw(game.make.image(0, 0, c, a), 20, 20);
                break;
            case 9:
                d = game.add.bitmapData(40, 40);
                d.draw(game.make.image(0, 0, c, a), 20, 0);
                d.draw(game.make.image(0, 0, c, a), 20, 20);
                d.draw(game.make.image(0, 0, c, a), 0, 20);
                break;
            case 10:
                d = game.add.bitmapData(40,
                    40);
                d.draw(game.make.image(0, 0, c, a), 0, 0);
                d.draw(game.make.image(0, 0, c, a), 20, 0);
                d.draw(game.make.image(0, 0, c, a), 0, 20);
                break;
            case 11:
                d = game.add.bitmapData(40, 40);
                d.draw(game.make.image(0, 0, c, a), 0, 0);
                d.draw(game.make.image(0, 0, c, a), 20, 0);
                d.draw(game.make.image(0, 0, c, a), 20, 20);
                break;
            case 12:
                d = game.add.bitmapData(40, 60);
                d.draw(game.make.image(0, 0, c, a), 0, 0);
                d.draw(game.make.image(0, 0, c, a), 0, 20);
                d.draw(game.make.image(0, 0, c, a), 0, 40);
                d.draw(game.make.image(0, 0, c, a), 20, 40);
                break;
            case 13:
                d = game.add.bitmapData(40,
                    60);
                d.draw(game.make.image(0, 0, c, a), 20, 0);
                d.draw(game.make.image(0, 0, c, a), 20, 20);
                d.draw(game.make.image(0, 0, c, a), 0, 40);
                d.draw(game.make.image(0, 0, c, a), 20, 40);
                break;
            case 14:
                d = game.add.bitmapData(40, 60);
                d.draw(game.make.image(0, 0, c, a), 0, 0);
                d.draw(game.make.image(0, 0, c, a), 0, 20);
                d.draw(game.make.image(0, 0, c, a), 0, 40);
                d.draw(game.make.image(0, 0, c, a), 20, 0);
                break;
            case 15:
                d = game.add.bitmapData(40, 60);
                d.draw(game.make.image(0, 0, c, a), 0, 0);
                d.draw(game.make.image(0, 0, c, a), 20, 0);
                d.draw(game.make.image(0, 0, c, a),
                    20, 20);
                d.draw(game.make.image(0, 0, c, a), 20, 40);
                break;
            case 16:
                d = game.add.bitmapData(60, 40);
                d.draw(game.make.image(0, 0, c, a), 0, 0);
                d.draw(game.make.image(0, 0, c, a), 0, 20);
                d.draw(game.make.image(0, 0, c, a), 20, 20);
                d.draw(game.make.image(0, 0, c, a), 40, 20);
                break;
            case 17:
                d = game.add.bitmapData(60, 40);
                d.draw(game.make.image(0, 0, c, a), 0, 0);
                d.draw(game.make.image(0, 0, c, a), 20, 0);
                d.draw(game.make.image(0, 0, c, a), 40, 0);
                d.draw(game.make.image(0, 0, c, a), 40, 20);
                break;
            case 18:
                d = game.add.bitmapData(60, 40);
                d.draw(game.make.image(0,
                    0, c, a), 0, 0);
                d.draw(game.make.image(0, 0, c, a), 20, 0);
                d.draw(game.make.image(0, 0, c, a), 40, 0);
                d.draw(game.make.image(0, 0, c, a), 0, 20);
                break;
            case 19:
                d = game.add.bitmapData(60, 40);
                d.draw(game.make.image(0, 0, c, a), 0, 20);
                d.draw(game.make.image(0, 0, c, a), 20, 20);
                d.draw(game.make.image(0, 0, c, a), 40, 20);
                d.draw(game.make.image(0, 0, c, a), 40, 0);
                break;
            case 20:
                d = game.add.bitmapData(20, 20);
                d.draw(game.make.image(0, 0, c, a), 0, 0);
                break;
            case 21:
                d = game.add.bitmapData(20, 40);
                d.draw(game.make.image(0, 0, c, a), 0, 0);
                d.draw(game.make.image(0,
                    0, c, a), 0, 20);
                break;
            case 22:
                d = game.add.bitmapData(40, 20);
                d.draw(game.make.image(0, 0, c, a), 0, 0);
                d.draw(game.make.image(0, 0, c, a), 20, 0);
                break;
            case 23:
                d = game.add.bitmapData(20, 60);
                d.draw(game.make.image(0, 0, c, a), 0, 0);
                d.draw(game.make.image(0, 0, c, a), 0, 20);
                d.draw(game.make.image(0, 0, c, a), 0, 40);
                break;
            case 24:
                d = game.add.bitmapData(60, 20);
                d.draw(game.make.image(0, 0, c, a), 0, 0);
                d.draw(game.make.image(0, 0, c, a), 20, 0);
                d.draw(game.make.image(0, 0, c, a), 40, 0);
                break;
            case 25:
                d = game.add.bitmapData(20, 80);
                d.draw(game.make.image(0,
                    0, c, a), 0, 0);
                d.draw(game.make.image(0, 0, c, a), 0, 20);
                d.draw(game.make.image(0, 0, c, a), 0, 40);
                d.draw(game.make.image(0, 0, c, a), 0, 60);
                break;
            case 26:
                d = game.add.bitmapData(80, 20);
                d.draw(game.make.image(0, 0, c, a), 0, 0);
                d.draw(game.make.image(0, 0, c, a), 20, 0);
                d.draw(game.make.image(0, 0, c, a), 40, 0);
                d.draw(game.make.image(0, 0, c, a), 60, 0);
                break;
            case 27:
                d = game.add.bitmapData(20, 100);
                for (b = 0; 5 > b; b++) d.draw(game.make.image(0, 0, c, a), 0, 20 * b);
                break;
            case 28:
                d = game.add.bitmapData(100, 20);
                for (b = 0; 5 > b; b++) d.draw(game.make.image(0,
                    0, c, a), 20 * b, 0);
                break;
            case 29:
                d = game.add.bitmapData(60, 40);
                d.draw(game.make.image(0, 0, c, a), 0, 20);
                d.draw(game.make.image(0, 0, c, a), 20, 20);
                d.draw(game.make.image(0, 0, c, a), 40, 20);
                d.draw(game.make.image(0, 0, c, a), 20, 0);
                break;
            case 30:
                d = game.add.bitmapData(40, 60);
                d.draw(game.make.image(0, 0, c, a), 0, 0);
                d.draw(game.make.image(0, 0, c, a), 0, 20);
                d.draw(game.make.image(0, 0, c, a), 0, 40);
                d.draw(game.make.image(0, 0, c, a), 20, 20);
                break;
            case 31:
                d = game.add.bitmapData(60, 40);
                d.draw(game.make.image(0, 0, c, a), 0, 0);
                d.draw(game.make.image(0,
                    0, c, a), 20, 0);
                d.draw(game.make.image(0, 0, c, a), 40, 0);
                d.draw(game.make.image(0, 0, c, a), 20, 20);
                break;
            case 32:
                d = game.add.bitmapData(40, 60);
                d.draw(game.make.image(0, 0, c, a), 20, 0);
                d.draw(game.make.image(0, 0, c, a), 20, 20);
                d.draw(game.make.image(0, 0, c, a), 0, 20);
                d.draw(game.make.image(0, 0, c, a), 20, 40);
                break;
            case 33:
                d = game.add.bitmapData(60, 40);
                d.draw(game.make.image(0, 0, c, a), 40, 0);
                d.draw(game.make.image(0, 0, c, a), 0, 20);
                d.draw(game.make.image(0, 0, c, a), 20, 20);
                d.draw(game.make.image(0, 0, c, a), 20, 0);
                break;
            case 34:
                d = game.add.bitmapData(40,
                    60);
                d.draw(game.make.image(0, 0, c, a), 0, 0);
                d.draw(game.make.image(0, 0, c, a), 0, 20);
                d.draw(game.make.image(0, 0, c, a), 20, 20);
                d.draw(game.make.image(0, 0, c, a), 20, 40);
                break;
            case 35:
                d = game.add.bitmapData(60, 60), d.draw(game.make.image(0, 0, c, a), 20, 0), d.draw(game.make.image(0, 0, c, a), 0, 20), d.draw(game.make.image(0, 0, c, a), 20, 20), d.draw(game.make.image(0, 0, c, a), 40, 20), d.draw(game.make.image(0, 0, c, a), 20, 40)
        }
        if (null != e) game.cache.addBitmapData(e, d);
        else return d
    },
    createBlock: function(b, a, c, e) {
        var d;
        switch (b) {
            case 0:
                d =
                    game.add.bitmapData(3 * TILE_SIZE_BIG, 2 * TILE_SIZE_BIG);
                d.draw(game.make.image(0, 0, c, a), 0, 0);
                d.draw(game.make.image(0, 0, c, a), TILE_SIZE_BIG, 0);
                d.draw(game.make.image(0, 0, c, a), TILE_SIZE_BIG, TILE_SIZE_BIG);
                d.draw(game.make.image(0, 0, c, a), 2 * TILE_SIZE_BIG, TILE_SIZE_BIG);
                break;
            case 1:
                d = game.add.bitmapData(2 * TILE_SIZE_BIG, 3 * TILE_SIZE_BIG);
                d.draw(game.make.image(0, 0, c, a), TILE_SIZE_BIG, 0);
                d.draw(game.make.image(0, 0, c, a), TILE_SIZE_BIG, TILE_SIZE_BIG);
                d.draw(game.make.image(0, 0, c, a), 0, TILE_SIZE_BIG);
                d.draw(game.make.image(0,
                    0, c, a), 0, 2 * TILE_SIZE_BIG);
                break;
            case 2:
                d = game.add.bitmapData(3 * TILE_SIZE_BIG, 3 * TILE_SIZE_BIG);
                for (b = 0; 3 > b; b++)
                    for (f = 0; 3 > f; f++) d.draw(game.make.image(0, 0, c, a), b * TILE_SIZE_BIG, f * TILE_SIZE_BIG);
                break;
            case 3:
                d = game.add.bitmapData(2 * TILE_SIZE_BIG, 2 * TILE_SIZE_BIG);
                for (b = 0; 2 > b; b++)
                    for (var f = 0; 2 > f; f++) d.draw(game.make.image(0, 0, c, a), b * TILE_SIZE_BIG, f * TILE_SIZE_BIG);
                break;
            case 4:
                d = game.add.bitmapData(3 * TILE_SIZE_BIG, 3 * TILE_SIZE_BIG);
                d.draw(game.make.image(0, 0, c, a), 0, 0);
                d.draw(game.make.image(0, 0, c, a), 0, TILE_SIZE_BIG);
                d.draw(game.make.image(0, 0, c, a), 0, 2 * TILE_SIZE_BIG);
                d.draw(game.make.image(0, 0, c, a), TILE_SIZE_BIG, 2 * TILE_SIZE_BIG);
                d.draw(game.make.image(0, 0, c, a), 2 * TILE_SIZE_BIG, 2 * TILE_SIZE_BIG);
                break;
            case 5:
                d = game.add.bitmapData(3 * TILE_SIZE_BIG, 3 * TILE_SIZE_BIG);
                d.draw(game.make.image(0, 0, c, a), 2 * TILE_SIZE_BIG, 0);
                d.draw(game.make.image(0, 0, c, a), 2 * TILE_SIZE_BIG, TILE_SIZE_BIG);
                d.draw(game.make.image(0, 0, c, a), 2 * TILE_SIZE_BIG, 2 * TILE_SIZE_BIG);
                d.draw(game.make.image(0, 0, c, a), TILE_SIZE_BIG, 2 * TILE_SIZE_BIG);
                d.draw(game.make.image(0,
                    0, c, a), 0, 2 * TILE_SIZE_BIG);
                break;
            case 6:
                d = game.add.bitmapData(3 * TILE_SIZE_BIG, 3 * TILE_SIZE_BIG);
                d.draw(game.make.image(0, 0, c, a), 0, 0);
                d.draw(game.make.image(0, 0, c, a), 0, TILE_SIZE_BIG);
                d.draw(game.make.image(0, 0, c, a), 0, 2 * TILE_SIZE_BIG);
                d.draw(game.make.image(0, 0, c, a), TILE_SIZE_BIG, 0);
                d.draw(game.make.image(0, 0, c, a), 2 * TILE_SIZE_BIG, 0);
                break;
            case 7:
                d = game.add.bitmapData(3 * TILE_SIZE_BIG, 3 * TILE_SIZE_BIG);
                d.draw(game.make.image(0, 0, c, a), 0, 0);
                d.draw(game.make.image(0, 0, c, a), TILE_SIZE_BIG, 0);
                d.draw(game.make.image(0,
                    0, c, a), 2 * TILE_SIZE_BIG, 0);
                d.draw(game.make.image(0, 0, c, a), 2 * TILE_SIZE_BIG, TILE_SIZE_BIG);
                d.draw(game.make.image(0, 0, c, a), 2 * TILE_SIZE_BIG, 2 * TILE_SIZE_BIG);
                break;
            case 8:
                d = game.add.bitmapData(2 * TILE_SIZE_BIG, 2 * TILE_SIZE_BIG);
                d.draw(game.make.image(0, 0, c, a), 0, 0);
                d.draw(game.make.image(0, 0, c, a), 0, TILE_SIZE_BIG);
                d.draw(game.make.image(0, 0, c, a), TILE_SIZE_BIG, TILE_SIZE_BIG);
                break;
            case 9:
                d = game.add.bitmapData(2 * TILE_SIZE_BIG, 2 * TILE_SIZE_BIG);
                d.draw(game.make.image(0, 0, c, a), 0, TILE_SIZE_BIG);
                d.draw(game.make.image(0,
                    0, c, a), TILE_SIZE_BIG, TILE_SIZE_BIG);
                d.draw(game.make.image(0, 0, c, a), TILE_SIZE_BIG, 0);
                break;
            case 10:
                d = game.add.bitmapData(2 * TILE_SIZE_BIG, 2 * TILE_SIZE_BIG);
                d.draw(game.make.image(0, 0, c, a), 0, 0);
                d.draw(game.make.image(0, 0, c, a), 0, TILE_SIZE_BIG);
                d.draw(game.make.image(0, 0, c, a), TILE_SIZE_BIG, 0);
                break;
            case 11:
                d = game.add.bitmapData(2 * TILE_SIZE_BIG, 2 * TILE_SIZE_BIG);
                d.draw(game.make.image(0, 0, c, a), 0, 0);
                d.draw(game.make.image(0, 0, c, a), TILE_SIZE_BIG, 0);
                d.draw(game.make.image(0, 0, c, a), TILE_SIZE_BIG, TILE_SIZE_BIG);
                break;
            case 12:
                d = game.add.bitmapData(2 * TILE_SIZE_BIG, 3 * TILE_SIZE_BIG);
                d.draw(game.make.image(0, 0, c, a), 0, 0);
                d.draw(game.make.image(0, 0, c, a), 0, TILE_SIZE_BIG);
                d.draw(game.make.image(0, 0, c, a), 0, 2 * TILE_SIZE_BIG);
                d.draw(game.make.image(0, 0, c, a), TILE_SIZE_BIG, 2 * TILE_SIZE_BIG);
                break;
            case 13:
                d = game.add.bitmapData(2 * TILE_SIZE_BIG, 3 * TILE_SIZE_BIG);
                d.draw(game.make.image(0, 0, c, a), TILE_SIZE_BIG, 0);
                d.draw(game.make.image(0, 0, c, a), TILE_SIZE_BIG, TILE_SIZE_BIG);
                d.draw(game.make.image(0, 0, c, a), TILE_SIZE_BIG, 2 * TILE_SIZE_BIG);
                d.draw(game.make.image(0, 0, c, a), 0, 2 * TILE_SIZE_BIG);
                break;
            case 14:
                d = game.add.bitmapData(2 * TILE_SIZE_BIG, 3 * TILE_SIZE_BIG);
                d.draw(game.make.image(0, 0, c, a), 0, 0);
                d.draw(game.make.image(0, 0, c, a), 0, TILE_SIZE_BIG);
                d.draw(game.make.image(0, 0, c, a), 0, 2 * TILE_SIZE_BIG);
                d.draw(game.make.image(0, 0, c, a), TILE_SIZE_BIG, 0);
                break;
            case 15:
                d = game.add.bitmapData(2 * TILE_SIZE_BIG, 3 * TILE_SIZE_BIG);
                d.draw(game.make.image(0, 0, c, a), 0, 0);
                d.draw(game.make.image(0, 0, c, a), TILE_SIZE_BIG, 0);
                d.draw(game.make.image(0, 0, c, a), TILE_SIZE_BIG,
                    TILE_SIZE_BIG);
                d.draw(game.make.image(0, 0, c, a), TILE_SIZE_BIG, 2 * TILE_SIZE_BIG);
                break;
            case 16:
                d = game.add.bitmapData(3 * TILE_SIZE_BIG, 2 * TILE_SIZE_BIG);
                d.draw(game.make.image(0, 0, c, a), 0, 0);
                d.draw(game.make.image(0, 0, c, a), 0, TILE_SIZE_BIG);
                d.draw(game.make.image(0, 0, c, a), TILE_SIZE_BIG, TILE_SIZE_BIG);
                d.draw(game.make.image(0, 0, c, a), 2 * TILE_SIZE_BIG, TILE_SIZE_BIG);
                break;
            case 17:
                d = game.add.bitmapData(3 * TILE_SIZE_BIG, 2 * TILE_SIZE_BIG);
                d.draw(game.make.image(0, 0, c, a), 0, 0);
                d.draw(game.make.image(0, 0, c, a), TILE_SIZE_BIG,
                    0);
                d.draw(game.make.image(0, 0, c, a), 2 * TILE_SIZE_BIG, 0);
                d.draw(game.make.image(0, 0, c, a), 2 * TILE_SIZE_BIG, TILE_SIZE_BIG);
                break;
            case 18:
                d = game.add.bitmapData(3 * TILE_SIZE_BIG, 2 * TILE_SIZE_BIG);
                d.draw(game.make.image(0, 0, c, a), 0, 0);
                d.draw(game.make.image(0, 0, c, a), TILE_SIZE_BIG, 0);
                d.draw(game.make.image(0, 0, c, a), 2 * TILE_SIZE_BIG, 0);
                d.draw(game.make.image(0, 0, c, a), 0, TILE_SIZE_BIG);
                break;
            case 19:
                d = game.add.bitmapData(3 * TILE_SIZE_BIG, 2 * TILE_SIZE_BIG);
                d.draw(game.make.image(0, 0, c, a), 0, TILE_SIZE_BIG);
                d.draw(game.make.image(0,
                    0, c, a), TILE_SIZE_BIG, TILE_SIZE_BIG);
                d.draw(game.make.image(0, 0, c, a), 2 * TILE_SIZE_BIG, TILE_SIZE_BIG);
                d.draw(game.make.image(0, 0, c, a), 2 * TILE_SIZE_BIG, 0);
                break;
            case 20:
                d = game.add.bitmapData(TILE_SIZE_BIG, TILE_SIZE_BIG);
                d.draw(game.make.image(0, 0, c, a), 0, 0);
                break;
            case 21:
                d = game.add.bitmapData(TILE_SIZE_BIG, 2 * TILE_SIZE_BIG);
                d.draw(game.make.image(0, 0, c, a), 0, 0);
                d.draw(game.make.image(0, 0, c, a), 0, TILE_SIZE_BIG);
                break;
            case 22:
                d = game.add.bitmapData(2 * TILE_SIZE_BIG, TILE_SIZE_BIG);
                d.draw(game.make.image(0, 0, c,
                    a), 0, 0);
                d.draw(game.make.image(0, 0, c, a), TILE_SIZE_BIG, 0);
                break;
            case 23:
                d = game.add.bitmapData(TILE_SIZE_BIG, 3 * TILE_SIZE_BIG);
                d.draw(game.make.image(0, 0, c, a), 0, 0);
                d.draw(game.make.image(0, 0, c, a), 0, TILE_SIZE_BIG);
                d.draw(game.make.image(0, 0, c, a), 0, 2 * TILE_SIZE_BIG);
                break;
            case 24:
                d = game.add.bitmapData(3 * TILE_SIZE_BIG, TILE_SIZE_BIG);
                d.draw(game.make.image(0, 0, c, a), 0, 0);
                d.draw(game.make.image(0, 0, c, a), TILE_SIZE_BIG, 0);
                d.draw(game.make.image(0, 0, c, a), 2 * TILE_SIZE_BIG, 0);
                break;
            case 25:
                d = game.add.bitmapData(TILE_SIZE_BIG,
                    4 * TILE_SIZE_BIG);
                d.draw(game.make.image(0, 0, c, a), 0, 0);
                d.draw(game.make.image(0, 0, c, a), 0, TILE_SIZE_BIG);
                d.draw(game.make.image(0, 0, c, a), 0, 2 * TILE_SIZE_BIG);
                d.draw(game.make.image(0, 0, c, a), 0, 3 * TILE_SIZE_BIG);
                break;
            case 26:
                d = game.add.bitmapData(4 * TILE_SIZE_BIG, TILE_SIZE_BIG);
                d.draw(game.make.image(0, 0, c, a), 0, 0);
                d.draw(game.make.image(0, 0, c, a), TILE_SIZE_BIG, 0);
                d.draw(game.make.image(0, 0, c, a), 2 * TILE_SIZE_BIG, 0);
                d.draw(game.make.image(0, 0, c, a), 3 * TILE_SIZE_BIG, 0);
                break;
            case 27:
                d = game.add.bitmapData(TILE_SIZE_BIG,
                    5 * TILE_SIZE_BIG);
                for (b = 0; 5 > b; b++) d.draw(game.make.image(0, 0, c, a), 0, b * TILE_SIZE_BIG);
                break;
            case 28:
                d = game.add.bitmapData(5 * TILE_SIZE_BIG, TILE_SIZE_BIG);
                for (b = 0; 5 > b; b++) d.draw(game.make.image(0, 0, c, a), b * TILE_SIZE_BIG, 0);
                break;
            case 29:
                d = game.add.bitmapData(3 * TILE_SIZE_BIG, 2 * TILE_SIZE_BIG);
                d.draw(game.make.image(0, 0, c, a), 0, TILE_SIZE_BIG);
                d.draw(game.make.image(0, 0, c, a), TILE_SIZE_BIG, TILE_SIZE_BIG);
                d.draw(game.make.image(0, 0, c, a), 2 * TILE_SIZE_BIG, TILE_SIZE_BIG);
                d.draw(game.make.image(0, 0, c, a), TILE_SIZE_BIG,
                    0);
                break;
            case 30:
                d = game.add.bitmapData(2 * TILE_SIZE_BIG, 3 * TILE_SIZE_BIG);
                d.draw(game.make.image(0, 0, c, a), 0, 0);
                d.draw(game.make.image(0, 0, c, a), 0, TILE_SIZE_BIG);
                d.draw(game.make.image(0, 0, c, a), 0, 2 * TILE_SIZE_BIG);
                d.draw(game.make.image(0, 0, c, a), TILE_SIZE_BIG, TILE_SIZE_BIG);
                break;
            case 31:
                d = game.add.bitmapData(3 * TILE_SIZE_BIG, 2 * TILE_SIZE_BIG);
                d.draw(game.make.image(0, 0, c, a), 0, 0);
                d.draw(game.make.image(0, 0, c, a), TILE_SIZE_BIG, 0);
                d.draw(game.make.image(0, 0, c, a), 2 * TILE_SIZE_BIG, 0);
                d.draw(game.make.image(0,
                    0, c, a), TILE_SIZE_BIG, TILE_SIZE_BIG);
                break;
            case 32:
                d = game.add.bitmapData(2 * TILE_SIZE_BIG, 3 * TILE_SIZE_BIG);
                d.draw(game.make.image(0, 0, c, a), TILE_SIZE_BIG, 0);
                d.draw(game.make.image(0, 0, c, a), TILE_SIZE_BIG, TILE_SIZE_BIG);
                d.draw(game.make.image(0, 0, c, a), 0, TILE_SIZE_BIG);
                d.draw(game.make.image(0, 0, c, a), TILE_SIZE_BIG, 2 * TILE_SIZE_BIG);
                break;
            case 33:
                d = game.add.bitmapData(3 * TILE_SIZE_BIG, 2 * TILE_SIZE_BIG);
                d.draw(game.make.image(0, 0, c, a), 2 * TILE_SIZE_BIG, 0);
                d.draw(game.make.image(0, 0, c, a), 0, TILE_SIZE_BIG);
                d.draw(game.make.image(0,
                    0, c, a), TILE_SIZE_BIG, TILE_SIZE_BIG);
                d.draw(game.make.image(0, 0, c, a), TILE_SIZE_BIG, 0);
                break;
            case 34:
                d = game.add.bitmapData(2 * TILE_SIZE_BIG, 3 * TILE_SIZE_BIG);
                d.draw(game.make.image(0, 0, c, a), 0, 0);
                d.draw(game.make.image(0, 0, c, a), 0, TILE_SIZE_BIG);
                d.draw(game.make.image(0, 0, c, a), TILE_SIZE_BIG, TILE_SIZE_BIG);
                d.draw(game.make.image(0, 0, c, a), TILE_SIZE_BIG, 2 * TILE_SIZE_BIG);
                break;
            case 35:
                d = game.add.bitmapData(3 * TILE_SIZE_BIG, 3 * TILE_SIZE_BIG), d.draw(game.make.image(0, 0, c, a), TILE_SIZE_BIG, 0), d.draw(game.make.image(0,
                    0, c, a), 0, TILE_SIZE_BIG), d.draw(game.make.image(0, 0, c, a), TILE_SIZE_BIG, TILE_SIZE_BIG), d.draw(game.make.image(0, 0, c, a), 2 * TILE_SIZE_BIG, TILE_SIZE_BIG), d.draw(game.make.image(0, 0, c, a), TILE_SIZE_BIG, 2 * TILE_SIZE_BIG)
        }
        return null != e ? (game.cache.addBitmapData(e, d), e) : d
    },
    destroyRow: function(b, a, c) {
        for (var e = 0; e < b.length; e++)
            for (var d = b[e], f = 0; f < BOARD_SIZE; f++)
                if (!0 === gameBoardSprites[d][f].visible) {
                    gameBoardSprites[d][f].loadTexture("tiles", a);
                    particle = game.add.sprite(-100, -100, "particle");
                    var g = gameBoardSprites[d][f];
                    e === b.length - 1 && 7 === f && !0 === c && game.time.events.add(50 * f, this.hideTileEnd, this, g);
                    game.time.events.add(50 * f, this.hideTile, this, g)
                }
    },
    hideTile: function(b) {
        particle.x = b.x;
        particle.y = b.y;
        b.visible = !1;
        b.alpha = 1;
        particle.animations.add("destroyAnim");
        particle.animations.play("destroyAnim", 10, !1, !0)
    },
    hideTileEnd: function(b) {
        particle.x = b.x;
        particle.y = b.y;
        b.visible = !1;
        b.alpha = 1;
        particle.animations.add("destroyAnim");
        particle.animations.play("destroyAnim", 10, !1, !0);
        this.checkMove()
    },
    checkRow: function() {
        for (var b =
                0, a = [], c = 0; 8 > c; c++) {
            for (var e = 0; 8 > e; e++) !0 === gameBoardSprites[c][e].visible && b++;
            8 === b && a.push(c);
            b = 0
        }
        return a
    },
    destroyCol: function(b, a) {
        for (var c = 0; c < b.length; c++)
            for (var e = b[c], d = 0; d < BOARD_SIZE; d++)
                if (!0 === gameBoardSprites[d][e].visible) {
                    gameBoardSprites[d][e].loadTexture("tiles", a);
                    particle = game.add.sprite(-100, -100, "particle");
                    var f = gameBoardSprites[d][e];
                    c === b.length - 1 && 7 === d && game.time.events.add(50 * d, this.hideTileEnd, this, f);
                    game.time.events.add(50 * d, this.hideTile, this, f)
                }
    },
    checkCol: function() {
        for (var b =
                0, a = [], c = 0; 8 > c; c++) {
            for (var e = 0; 8 > e; e++) !0 === gameBoardSprites[e][c].visible && b++;
            8 === b && a.push(c);
            b = 0
        }
        return a
    },
    checkBlock: function(b) {
        for (var a = 0; a < BOARD_SIZE; a++)
            for (var c = 0; c < BOARD_SIZE; c++) switch (b.data[0]) {
                case 0:
                    if (7 > a && 6 > c && !1 === gameBoardSprites[a][c].visible && !1 === gameBoardSprites[a][c + 1].visible && !1 === gameBoardSprites[a + 1][c + 1].visible && !1 === gameBoardSprites[a + 1][c + 2].visible) return !1;
                    break;
                case 1:
                    if (6 > a && 7 > c && !1 === gameBoardSprites[a][c + 1].visible && !1 === gameBoardSprites[a + 1][c + 1].visible &&
                        !1 === gameBoardSprites[a + 1][c].visible && !1 === gameBoardSprites[a + 2][c].visible) return !1;
                    break;
                case 2:
                    if (6 > a && 6 > c && !1 === gameBoardSprites[a][c].visible && !1 === gameBoardSprites[a][c + 1].visible && !1 === gameBoardSprites[a][c + 2].visible && !1 === gameBoardSprites[a + 1][c].visible && !1 === gameBoardSprites[a + 1][c + 1].visible && !1 === gameBoardSprites[a + 1][c + 2].visible && !1 === gameBoardSprites[a + 2][c].visible && !1 === gameBoardSprites[a + 2][c + 1].visible && !1 === gameBoardSprites[a + 2][c + 2].visible) return !1;
                    break;
                case 3:
                    if (7 > a && 7 > c &&
                        !1 === gameBoardSprites[a][c].visible && !1 === gameBoardSprites[a][c + 1].visible && !1 === gameBoardSprites[a + 1][c].visible && !1 === gameBoardSprites[a + 1][c + 1].visible) return !1;
                    break;
                case 4:
                    if (6 > a && 6 > c && !1 === gameBoardSprites[a][c].visible && !1 === gameBoardSprites[a + 1][c].visible && !1 === gameBoardSprites[a + 2][c].visible && !1 === gameBoardSprites[a + 2][c + 1].visible && !1 === gameBoardSprites[a + 2][c + 2].visible) return !1;
                    break;
                case 5:
                    if (6 > a && 1 < c && !1 === gameBoardSprites[a][c].visible && !1 === gameBoardSprites[a + 1][c].visible && !1 ===
                        gameBoardSprites[a + 2][c].visible && !1 === gameBoardSprites[a + 2][c - 1].visible && !1 === gameBoardSprites[a + 2][c - 2].visible) return !1;
                    break;
                case 6:
                    if (6 > a && 6 > c && !1 === gameBoardSprites[a][c].visible && !1 === gameBoardSprites[a + 1][c].visible && !1 === gameBoardSprites[a + 2][c].visible && !1 === gameBoardSprites[a][c + 1].visible && !1 === gameBoardSprites[a][c + 2].visible) return !1;
                    break;
                case 7:
                    if (6 > a && 6 > c && !1 === gameBoardSprites[a][c].visible && !1 === gameBoardSprites[a][c + 1].visible && !1 === gameBoardSprites[a][c + 2].visible && !1 === gameBoardSprites[a +
                            1][c + 2].visible && !1 === gameBoardSprites[a + 2][c + 2].visible) return !1;
                    break;
                case 8:
                    if (7 > a && 7 > c && !1 === gameBoardSprites[a][c].visible && !1 === gameBoardSprites[a + 1][c].visible && !1 === gameBoardSprites[a + 1][c + 1].visible) return !1;
                    break;
                case 9:
                    if (7 > a && 0 < c && !1 === gameBoardSprites[a][c].visible && !1 === gameBoardSprites[a + 1][c].visible && !1 === gameBoardSprites[a + 1][c - 1].visible) return !1;
                    break;
                case 10:
                    if (7 > a && 7 > c && !1 === gameBoardSprites[a][c].visible && !1 === gameBoardSprites[a + 1][c].visible && !1 === gameBoardSprites[a][c + 1].visible) return !1;
                    break;
                case 11:
                    if (7 > a && 7 > c && !1 === gameBoardSprites[a][c].visible && !1 === gameBoardSprites[a][c + 1].visible && !1 === gameBoardSprites[a + 1][c + 1].visible) return !1;
                    break;
                case 12:
                    if (6 > a && 7 > c && !1 === gameBoardSprites[a][c].visible && !1 === gameBoardSprites[a + 1][c].visible && !1 === gameBoardSprites[a + 2][c].visible && !1 === gameBoardSprites[a + 2][c + 1].visible) return !1;
                    break;
                case 13:
                    if (6 > a && 0 < c && !1 === gameBoardSprites[a][c].visible && !1 === gameBoardSprites[a + 1][c].visible && !1 === gameBoardSprites[a + 2][c].visible && !1 === gameBoardSprites[a +
                            2][c - 1].visible) return !1;
                    break;
                case 14:
                    if (6 > a && 7 > c && !1 === gameBoardSprites[a][c].visible && !1 === gameBoardSprites[a + 1][c].visible && !1 === gameBoardSprites[a + 2][c].visible && !1 === gameBoardSprites[a][c + 1].visible) return !1;
                    break;
                case 15:
                    if (6 > a && 7 > c && !1 === gameBoardSprites[a][c].visible && !1 === gameBoardSprites[a][c + 1].visible && !1 === gameBoardSprites[a + 1][c + 1].visible && !1 === gameBoardSprites[a + 2][c + 1].visible) return !1;
                    break;
                case 16:
                    if (7 > a && 6 > c && !1 === gameBoardSprites[a][c].visible && !1 === gameBoardSprites[a + 1][c].visible &&
                        !1 === gameBoardSprites[a + 1][c + 1].visible && !1 === gameBoardSprites[a + 1][c + 2].visible) return !1;
                    break;
                case 17:
                    if (7 > a && 6 > c && !1 === gameBoardSprites[a][c].visible && !1 === gameBoardSprites[a][c + 1].visible && !1 === gameBoardSprites[a][c + 2].visible && !1 === gameBoardSprites[a + 1][c + 2].visible) return !1;
                    break;
                case 18:
                    if (7 > a && 6 > c && !1 === gameBoardSprites[a][c].visible && !1 === gameBoardSprites[a + 1][c].visible && !1 === gameBoardSprites[a][c + 1].visible && !1 === gameBoardSprites[a][c + 2].visible) return !1;
                    break;
                case 19:
                    if (0 < a && 6 > c && !1 ===
                        gameBoardSprites[a][c].visible && !1 === gameBoardSprites[a][c + 1].visible && !1 === gameBoardSprites[a][c + 2].visible && !1 === gameBoardSprites[a - 1][c + 2].visible) return !1;
                    break;
                case 20:
                    if (!1 === gameBoardSprites[a][c].visible) return !1;
                    break;
                case 21:
                    if (7 > a && !1 === gameBoardSprites[a][c].visible && !1 === gameBoardSprites[a + 1][c].visible) return !1;
                    break;
                case 22:
                    if (7 > c && !1 === gameBoardSprites[a][c].visible && !1 === gameBoardSprites[a][c + 1].visible) return !1;
                    break;
                case 23:
                    if (6 > a && !1 === gameBoardSprites[a][c].visible && !1 === gameBoardSprites[a +
                            1][c].visible && !1 === gameBoardSprites[a + 2][c].visible) return !1;
                    break;
                case 24:
                    if (6 > c && !1 === gameBoardSprites[a][c].visible && !1 === gameBoardSprites[a][c + 1].visible && !1 === gameBoardSprites[a][c + 2].visible) return !1;
                    break;
                case 25:
                    if (5 > a && !1 === gameBoardSprites[a][c].visible && !1 === gameBoardSprites[a + 1][c].visible && !1 === gameBoardSprites[a + 2][c].visible && !1 === gameBoardSprites[a + 3][c].visible) return !1;
                    break;
                case 26:
                    if (5 > c && !1 === gameBoardSprites[a][c].visible && !1 === gameBoardSprites[a][c + 1].visible && !1 === gameBoardSprites[a][c +
                            2
                        ].visible && !1 === gameBoardSprites[a][c + 3].visible) return !1;
                    break;
                case 27:
                    if (4 > a && !1 === gameBoardSprites[a][c].visible && !1 === gameBoardSprites[a + 1][c].visible && !1 === gameBoardSprites[a + 2][c].visible && !1 === gameBoardSprites[a + 3][c].visible && !1 === gameBoardSprites[a + 4][c].visible) return !1;
                    break;
                case 28:
                    if (4 > c && !1 === gameBoardSprites[a][c].visible && !1 === gameBoardSprites[a][c + 1].visible && !1 === gameBoardSprites[a][c + 2].visible && !1 === gameBoardSprites[a][c + 3].visible && !1 === gameBoardSprites[a][c + 4].visible) return !1;
                    break;
                case 29:
                    if (7 > a && 6 > c && !1 === gameBoardSprites[a + 1][c].visible && !1 === gameBoardSprites[a + 1][c + 1].visible && !1 === gameBoardSprites[a][c + 1].visible && !1 === gameBoardSprites[a + 1][c + 2].visible) return !1;
                    break;
                case 30:
                    if (6 > a && 7 > c && !1 === gameBoardSprites[a][c].visible && !1 === gameBoardSprites[a + 1][c + 1].visible && !1 === gameBoardSprites[a + 1][c].visible && !1 === gameBoardSprites[a + 2][c].visible) return !1;
                    break;
                case 31:
                    if (7 > a && 6 > c && !1 === gameBoardSprites[a][c].visible && !1 === gameBoardSprites[a][c + 1].visible && !1 === gameBoardSprites[a +
                            1][c + 1].visible && !1 === gameBoardSprites[a][c + 2].visible) return !1;
                    break;
                case 32:
                    if (6 > a && 7 > c && !1 === gameBoardSprites[a + 1][c].visible && !1 === gameBoardSprites[a][c + 1].visible && !1 === gameBoardSprites[a + 1][c + 1].visible && !1 === gameBoardSprites[a + 2][c + 1].visible) return !1;
                    break;
                case 33:
                    if (7 > a && 6 > c && !1 === gameBoardSprites[a + 1][c].visible && !1 === gameBoardSprites[a + 1][c + 1].visible && !1 === gameBoardSprites[a][c + 1].visible && !1 === gameBoardSprites[a][c + 2].visible) return !1;
                    break;
                case 34:
                    if (6 > a && 7 > c && !1 === gameBoardSprites[a][c].visible &&
                        !1 === gameBoardSprites[a + 1][c].visible && !1 === gameBoardSprites[a + 1][c + 1].visible && !1 === gameBoardSprites[a + 2][c + 1].visible) return !1;
                    break;
                case 35:
                    if (6 > a && 6 > c && !1 === gameBoardSprites[a + 1][c].visible && !1 === gameBoardSprites[a + 1][c + 1].visible && !1 === gameBoardSprites[a + 1][c + 2].visible && !1 === gameBoardSprites[a][c + 1].visible && !1 === gameBoardSprites[a + 2][c + 1].visible) return !1
            }
        return !0
    },
    checkGameOver: function() {
        for (var b = 0; b < gameBlocks.length; b++)
            if (null != gameBlocks[b])
                for (var a = 0; a < BOARD_SIZE; a++)
                    for (var c = 0; c <
                        BOARD_SIZE; c++) switch (gameBlocks[b].data[0]) {
                        case 0:
                            if (7 > a && 6 > c && !1 === gameBoardSprites[a][c].visible && !1 === gameBoardSprites[a][c + 1].visible && !1 === gameBoardSprites[a + 1][c + 1].visible && !1 === gameBoardSprites[a + 1][c + 2].visible) return !1;
                            break;
                        case 1:
                            if (6 > a && 7 > c && !1 === gameBoardSprites[a][c + 1].visible && !1 === gameBoardSprites[a + 1][c + 1].visible && !1 === gameBoardSprites[a + 1][c].visible && !1 === gameBoardSprites[a + 2][c].visible) return !1;
                            break;
                        case 2:
                            if (6 > a && 6 > c && !1 === gameBoardSprites[a][c].visible && !1 === gameBoardSprites[a][c +
                                    1
                                ].visible && !1 === gameBoardSprites[a][c + 2].visible && !1 === gameBoardSprites[a + 1][c].visible && !1 === gameBoardSprites[a + 1][c + 1].visible && !1 === gameBoardSprites[a + 1][c + 2].visible && !1 === gameBoardSprites[a + 2][c].visible && !1 === gameBoardSprites[a + 2][c + 1].visible && !1 === gameBoardSprites[a + 2][c + 2].visible) return !1;
                            break;
                        case 3:
                            if (7 > a && 7 > c && !1 === gameBoardSprites[a][c].visible && !1 === gameBoardSprites[a][c + 1].visible && !1 === gameBoardSprites[a + 1][c].visible && !1 === gameBoardSprites[a + 1][c + 1].visible) return !1;
                            break;
                        case 4:
                            if (6 >
                                a && 6 > c && !1 === gameBoardSprites[a][c].visible && !1 === gameBoardSprites[a + 1][c].visible && !1 === gameBoardSprites[a + 2][c].visible && !1 === gameBoardSprites[a + 2][c + 1].visible && !1 === gameBoardSprites[a + 2][c + 2].visible) return !1;
                            break;
                        case 5:
                            if (6 > a && 1 < c && !1 === gameBoardSprites[a][c].visible && !1 === gameBoardSprites[a + 1][c].visible && !1 === gameBoardSprites[a + 2][c].visible && !1 === gameBoardSprites[a + 2][c - 1].visible && !1 === gameBoardSprites[a + 2][c - 2].visible) return !1;
                            break;
                        case 6:
                            if (6 > a && 6 > c && !1 === gameBoardSprites[a][c].visible &&
                                !1 === gameBoardSprites[a + 1][c].visible && !1 === gameBoardSprites[a + 2][c].visible && !1 === gameBoardSprites[a][c + 1].visible && !1 === gameBoardSprites[a][c + 2].visible) return !1;
                            break;
                        case 7:
                            if (6 > a && 6 > c && !1 === gameBoardSprites[a][c].visible && !1 === gameBoardSprites[a][c + 1].visible && !1 === gameBoardSprites[a][c + 2].visible && !1 === gameBoardSprites[a + 1][c + 2].visible && !1 === gameBoardSprites[a + 2][c + 2].visible) return !1;
                            break;
                        case 8:
                            if (7 > a && 7 > c && !1 === gameBoardSprites[a][c].visible && !1 === gameBoardSprites[a + 1][c].visible && !1 ===
                                gameBoardSprites[a + 1][c + 1].visible) return !1;
                            break;
                        case 9:
                            if (7 > a && 0 < c && !1 === gameBoardSprites[a][c].visible && !1 === gameBoardSprites[a + 1][c].visible && !1 === gameBoardSprites[a + 1][c - 1].visible) return !1;
                            break;
                        case 10:
                            if (7 > a && 7 > c && !1 === gameBoardSprites[a][c].visible && !1 === gameBoardSprites[a + 1][c].visible && !1 === gameBoardSprites[a][c + 1].visible) return !1;
                            break;
                        case 11:
                            if (7 > a && 7 > c && !1 === gameBoardSprites[a][c].visible && !1 === gameBoardSprites[a][c + 1].visible && !1 === gameBoardSprites[a + 1][c + 1].visible) return !1;
                            break;
                        case 12:
                            if (6 > a && 7 > c && !1 === gameBoardSprites[a][c].visible && !1 === gameBoardSprites[a + 1][c].visible && !1 === gameBoardSprites[a + 2][c].visible && !1 === gameBoardSprites[a + 2][c + 1].visible) return !1;
                            break;
                        case 13:
                            if (6 > a && 0 < c && !1 === gameBoardSprites[a][c].visible && !1 === gameBoardSprites[a + 1][c].visible && !1 === gameBoardSprites[a + 2][c].visible && !1 === gameBoardSprites[a + 2][c - 1].visible) return !1;
                            break;
                        case 14:
                            if (6 > a && 7 > c && !1 === gameBoardSprites[a][c].visible && !1 === gameBoardSprites[a + 1][c].visible && !1 === gameBoardSprites[a +
                                    2][c].visible && !1 === gameBoardSprites[a][c + 1].visible) return !1;
                            break;
                        case 15:
                            if (6 > a && 7 > c && !1 === gameBoardSprites[a][c].visible && !1 === gameBoardSprites[a][c + 1].visible && !1 === gameBoardSprites[a + 1][c + 1].visible && !1 === gameBoardSprites[a + 2][c + 1].visible) return !1;
                            break;
                        case 16:
                            if (7 > a && 6 > c && !1 === gameBoardSprites[a][c].visible && !1 === gameBoardSprites[a + 1][c].visible && !1 === gameBoardSprites[a + 1][c + 1].visible && !1 === gameBoardSprites[a + 1][c + 2].visible) return !1;
                            break;
                        case 17:
                            if (7 > a && 6 > c && !1 === gameBoardSprites[a][c].visible &&
                                !1 === gameBoardSprites[a][c + 1].visible && !1 === gameBoardSprites[a][c + 2].visible && !1 === gameBoardSprites[a + 1][c + 2].visible) return !1;
                            break;
                        case 18:
                            if (7 > a && 6 > c && !1 === gameBoardSprites[a][c].visible && !1 === gameBoardSprites[a + 1][c].visible && !1 === gameBoardSprites[a][c + 1].visible && !1 === gameBoardSprites[a][c + 2].visible) return !1;
                            break;
                        case 19:
                            if (0 < a && 6 > c && !1 === gameBoardSprites[a][c].visible && !1 === gameBoardSprites[a][c + 1].visible && !1 === gameBoardSprites[a][c + 2].visible && !1 === gameBoardSprites[a - 1][c + 2].visible) return !1;
                            break;
                        case 20:
                            if (!1 === gameBoardSprites[a][c].visible) return !1;
                            break;
                        case 21:
                            if (7 > a && !1 === gameBoardSprites[a][c].visible && !1 === gameBoardSprites[a + 1][c].visible) return !1;
                            break;
                        case 22:
                            if (7 > c && !1 === gameBoardSprites[a][c].visible && !1 === gameBoardSprites[a][c + 1].visible) return !1;
                            break;
                        case 23:
                            if (6 > a && !1 === gameBoardSprites[a][c].visible && !1 === gameBoardSprites[a + 1][c].visible && !1 === gameBoardSprites[a + 2][c].visible) return !1;
                            break;
                        case 24:
                            if (6 > c && !1 === gameBoardSprites[a][c].visible && !1 === gameBoardSprites[a][c +
                                    1
                                ].visible && !1 === gameBoardSprites[a][c + 2].visible) return !1;
                            break;
                        case 25:
                            if (5 > a && !1 === gameBoardSprites[a][c].visible && !1 === gameBoardSprites[a + 1][c].visible && !1 === gameBoardSprites[a + 2][c].visible && !1 === gameBoardSprites[a + 3][c].visible) return !1;
                            break;
                        case 26:
                            if (5 > c && !1 === gameBoardSprites[a][c].visible && !1 === gameBoardSprites[a][c + 1].visible && !1 === gameBoardSprites[a][c + 2].visible && !1 === gameBoardSprites[a][c + 3].visible) return !1;
                            break;
                        case 27:
                            if (4 > a && !1 === gameBoardSprites[a][c].visible && !1 === gameBoardSprites[a +
                                    1][c].visible && !1 === gameBoardSprites[a + 2][c].visible && !1 === gameBoardSprites[a + 3][c].visible && !1 === gameBoardSprites[a + 4][c].visible) return !1;
                            break;
                        case 28:
                            if (4 > c && !1 === gameBoardSprites[a][c].visible && !1 === gameBoardSprites[a][c + 1].visible && !1 === gameBoardSprites[a][c + 2].visible && !1 === gameBoardSprites[a][c + 3].visible && !1 === gameBoardSprites[a][c + 4].visible) return !1;
                            break;
                        case 29:
                            if (7 > a && 6 > c && !1 === gameBoardSprites[a + 1][c].visible && !1 === gameBoardSprites[a + 1][c + 1].visible && !1 === gameBoardSprites[a][c + 1].visible &&
                                !1 === gameBoardSprites[a + 1][c + 2].visible) return !1;
                            break;
                        case 30:
                            if (6 > a && 7 > c && !1 === gameBoardSprites[a][c].visible && !1 === gameBoardSprites[a + 1][c + 1].visible && !1 === gameBoardSprites[a + 1][c].visible && !1 === gameBoardSprites[a + 2][c].visible) return !1;
                            break;
                        case 31:
                            if (7 > a && 6 > c && !1 === gameBoardSprites[a][c].visible && !1 === gameBoardSprites[a][c + 1].visible && !1 === gameBoardSprites[a + 1][c + 1].visible && !1 === gameBoardSprites[a][c + 2].visible) return !1;
                            break;
                        case 32:
                            if (6 > a && 7 > c && !1 === gameBoardSprites[a + 1][c].visible && !1 ===
                                gameBoardSprites[a][c + 1].visible && !1 === gameBoardSprites[a + 1][c + 1].visible && !1 === gameBoardSprites[a + 2][c + 1].visible) return !1;
                            break;
                        case 33:
                            if (7 > a && 6 > c && !1 === gameBoardSprites[a + 1][c].visible && !1 === gameBoardSprites[a + 1][c + 1].visible && !1 === gameBoardSprites[a][c + 1].visible && !1 === gameBoardSprites[a][c + 2].visible) return !1;
                            break;
                        case 34:
                            if (6 > a && 7 > c && !1 === gameBoardSprites[a][c].visible && !1 === gameBoardSprites[a + 1][c].visible && !1 === gameBoardSprites[a + 1][c + 1].visible && !1 === gameBoardSprites[a + 2][c + 1].visible) return !1;
                            break;
                        case 35:
                            if (6 > a && 6 > c && !1 === gameBoardSprites[a + 1][c].visible && !1 === gameBoardSprites[a + 1][c + 1].visible && !1 === gameBoardSprites[a + 1][c + 2].visible && !1 === gameBoardSprites[a][c + 1].visible && !1 === gameBoardSprites[a + 2][c + 1].visible) return !1
                    }
        return !0
    },
    initGameBoard: function() {
        if (tutorial) this.initTutorialBoard();
        else
            for (var b = 0; 8 > b; b++)
                for (var a = 0; 8 > a; a++) {
                    var c = grpBlocks.create(49 + b * TILE_SIZE_BIG, 149 + a * TILE_SIZE_BIG, "tiles", 0);
                    c.visible = !1;
                    c.data[1] = 0;
                    c.data[0] = null;
                    var e = grpBlocks.create(49 + b * TILE_SIZE_BIG,
                        149 + a * TILE_SIZE_BIG, "tiles", 0);
                    e.visible = !1;
                    e.data[1] = 0;
                    e.data[0] = null;
                    e.exist = !1;
                    gameBoardSprites[a][b] = c;
                    gameBoardShadow[a][b] = 0;
                    gameBoardHistory[a][b] = e
                }
    },
    initTutorialBoard: function() {
        var b, a;
        if (1 === tutorialStage) {
            for (var c = 0; 8 > c; c++)
                for (var e = 0; 8 > e; e++) 2 < c && 5 > c && 4 !== e ? (b = grpBlocks.create(49 + c * TILE_SIZE_BIG, 149 + e * TILE_SIZE_BIG, "tiles", 2), b.visible = !0, b.data[1] = 2, b.data[0] = null, a = grpBlocks.create(49 + c * TILE_SIZE_BIG, 149 + e * TILE_SIZE_BIG, "tiles", 2), a.visible = !1, a.data[1] = 2, a.data[0] = null, a.exist = !0,
                    gameBoardSprites[e][c] = b, gameBoardShadow[e][c] = 1) : (b = grpBlocks.create(49 + c * TILE_SIZE_BIG, 149 + e * TILE_SIZE_BIG, "tiles", 0), b.visible = !1, b.data[1] = 0, b.data[0] = null, a = grpBlocks.create(49 + c * TILE_SIZE_BIG, 149 + e * TILE_SIZE_BIG, "tiles", 0), a.visible = !1, a.data[1] = 0, a.data[0] = null, a.exist = !1, gameBoardSprites[e][c] = b, gameBoardShadow[e][c] = 0), gameBoardHistory[e][c] = a;
            twn1 = game.add.tween(hand1).to({
                x: (game.width >> 1) - 10,
                y: (game.height >> 1) - 43
            }, 500, Phaser.Easing.Linear.None, !0, 1E3, 0).loop(!0);
            hand1.visible = !0
        }
        if (2 ===
            tutorialStage) {
            for (c = 0; 8 > c; c++)
                for (e = 0; 8 > e; e++) 2 < e && 6 > e && 4 !== c ? (b = grpBlocks.create(49 + c * TILE_SIZE_BIG, 149 + e * TILE_SIZE_BIG, "tiles", 2), b.visible = !0, b.aplha = .1, b.data[1] = 2, b.data[0] = null, a = grpBlocks.create(49 + c * TILE_SIZE_BIG, 149 + e * TILE_SIZE_BIG, "tiles", 2), a.visible = !1, a.data[1] = 2, a.data[0] = null, a.exist = !0, gameBoardSprites[e][c] = b, gameBoardShadow[e][c] = 1) : (b = grpBlocks.create(49 + c * TILE_SIZE_BIG, 149 + e * TILE_SIZE_BIG, "tiles", 0), b.visible = !1, b.data[1] = 0, b.data[0] = null, a = grpBlocks.create(49 + c * TILE_SIZE_BIG,
                    149 + e * TILE_SIZE_BIG, "tiles", 0), a.visible = !1, a.data[1] = 0, a.data[0] = null, a.exist = !1, gameBoardSprites[e][c] = b, gameBoardShadow[e][c] = 0), gameBoardHistory[e][c] = a;
            twn2 = game.add.tween(hand2).to({
                x: (game.width >> 1) + 20,
                y: (game.height >> 1) - 40
            }, 500, Phaser.Easing.Linear.None, !0, 1E3, 0).loop(!0);
            hand2.visible = !0
        }
        if (3 === tutorialStage) {
            for (c = 0; 8 > c; c++)
                for (e = 0; 8 > e; e++) 2 < e && 5 > e || 2 < c && 5 > c ? (b = grpBlocks.create(49 + c * TILE_SIZE_BIG, 149 + e * TILE_SIZE_BIG, "tiles", 2), b.visible = !0, b.aplha = .1, b.data[1] = 2, b.data[0] = null, a = grpBlocks.create(49 +
                    c * TILE_SIZE_BIG, 149 + e * TILE_SIZE_BIG, "tiles", 2), a.visible = !1, a.data[1] = 2, a.data[0] = null, a.exist = !0, gameBoardSprites[e][c] = b, gameBoardShadow[e][c] = 1) : (b = grpBlocks.create(49 + c * TILE_SIZE_BIG, 149 + e * TILE_SIZE_BIG, "tiles", 0), b.visible = !1, b.data[1] = 0, b.data[0] = null, a = grpBlocks.create(49 + c * TILE_SIZE_BIG, 149 + e * TILE_SIZE_BIG, "tiles", 0), a.visible = !1, a.data[1] = 0, a.data[0] = null, a.exist = !1, gameBoardSprites[e][c] = b, gameBoardShadow[e][c] = 0), gameBoardHistory[e][c] = a;
            for (c = 3; 5 > c; c++)
                for (e = 3; 5 > e; e++) gameBoardSprites[e][c].visible = !1, gameBoardShadow[e][c] = 0, gameBoardHistory[e][c].exist = !1;
            twn3 = game.add.tween(hand3).to({
                x: (game.width >> 1) - 10,
                y: (game.height >> 1) - 64
            }, 500, Phaser.Easing.Linear.None, !0, 1E3, 0).loop(!0);
            hand3.visible = !0
        }
    },
    handVisible: function(b) {
        b.visible = !0
    },
    tileVisible: function(b) {
        b.alpha = .1
    },
    logGameBoard: function() {
        for (var b = Array(BOARD_SIZE), a = 0; a < BOARD_SIZE; a++)
            for (var c = 0; c < BOARD_SIZE; c++) {
                var e = gameBoardSprites[a][c];
                if (null != e || void 0 != e) b[c] = !1 === e.visible ? 0 : 1
            }
        for (a = 0; a < b.length;) b[a] = null, a++;
        for (a = 0; a < BOARD_SIZE; a++)
            for (c =
                0; c < BOARD_SIZE; c++) e = gameBoardHistory[a][c], b[c] = !1 === e.exist ? 0 : 1
    },
    OnPressedUndo: function() {
        soundManager.playSound("undo_use");
        SceneGame.instance.toogleUndo(!1);
        undoMoves = undo;
        ScoreText.x = (game.width >> 1) + 30 - ScoreText.width / 2;
        score = scoreHistory;
        ScoreText.text = score;
        tutorial && (hand4.visible = !1, undoTwn.stop(), tutorial = !1);
        for (var b = 0; b < BOARD_SIZE; b++)
            for (var a = 0; a < BOARD_SIZE; a++) gameBoardSprites[b][a].loadTexture("tiles", gameBoardSprites[b][a].data[1]), gameBoardSprites[b][a].visible = gameBoardHistory[b][a].exist;
        if (0 === moves) {
            for (b = 0; b < gameBlocks.length; b++) null !== gameBlocks[b] && (gameBlocks[b].destroy(), gameBlocks[b] = null), null !== shadowBlocks[b] && shadowBlocks[b].destroy(), shadowBlocks[b] = null;
            moves = 3
        }
        moves--;
        b = gameBlocksHistory.data[2];
        gameBlocks[b] = gameBlocksHistory;
        gameBlocks[b].visible = !0;
        gameBlocks[b].x = gameBlocksHistory.dragStartPoint[0];
        gameBlocks[b].y = gameBlocksHistory.dragStartPoint[1];
        shadowBlocks[b] = shadowBlocksHistory;
        nameSprite = gameBlocksHistory.data[3];
        SceneGame.instance.createSmallBlock(gameBlocksHistory.data[0],
            gameBlocksHistory.data[1], "tilesSmall", nameSprite);
        gameBlocks[b].loadTexture(game.cache.getBitmapData(nameSprite));
        SceneGame.instance.movableBlocks();
        SceneGame.instance.checkMove();
        SceneGame.instance.gameBoardShadowUpdate()
    },
    OnPressedFromGameToPause: function() {
        soundManager.playSound("tile_select");
        gameRunning = !1;
        gamePaused = !0;
        SceneGame.instance.HideAnimated();
        ScenePause.instance.ShowAnimated()
    },
    ShowAnimated: function() {
        if (tutorial) switch (tutorialStage) {
            case 1:
                hand1.x = gameBlocks[0].dragStartPoint[0] +
                    10;
                hand1.y = gameBlocks[0].dragStartPoint[1];
                twn1 = game.add.tween(hand1).to({
                    x: (game.width >> 1) - 10,
                    y: (game.height >> 1) - 43
                }, 500, Phaser.Easing.Linear.None, !0, 1E3, 0).loop(!0);
                hand1.visible = !0;
                break;
            case 2:
                hand2.x = gameBlocks[2].dragStartPoint[0];
                hand2.y = gameBlocks[2].dragStartPoint[1] + 20;
                twn2 = game.add.tween(hand2).to({
                    x: (game.width >> 1) + 20,
                    y: (game.height >> 1) - 40
                }, 500, Phaser.Easing.Linear.None, !0, 1E3, 0).loop(!0);
                hand2.visible = !0;
                break;
            case 3:
                hand3.x = gameBlocks[1].dragStartPoint[0] + 10;
                hand3.y = gameBlocks[1].dragStartPoint[1] +
                    10;
                twn3 = game.add.tween(hand3).to({
                    x: (game.width >> 1) - 10,
                    y: (game.height >> 1) - 64
                }, 500, Phaser.Easing.Linear.None, !0, 1E3, 0).loop(!0);
                hand3.visible = !0;
                break;
            case 4:
                grpSceneGame.children[1].alpha = 1;
                dialogTwn = game.add.tween(grpSceneGame.children[1]).to({
                    alpha: 0
                }, 250, Phaser.Easing.Linear.None, !0, 0, 2, !0);
                dialogTwn.onComplete.add(this.moveBlocksFromRight, this);
                break;
            case 11:
                hand4.y = (game.height >> 1) + 332, hand4.x = game.width / 2 - 10, hand4.visible = !0, hand4.scale.set(.3), undoTwn = game.add.tween(hand4.scale).to({
                        x: .5,
                        y: .5
                    },
                    250, Phaser.Easing.Linear.None, !0, 0, -1, !0)
        }
        ScenesTransitions.transitionStarted();
        ScenesTransitions.TRANSITION_EFFECT_IN = Phaser.Easing.Quadratic.Out;
        ScenesTransitions.showSceneAlpha(grpSceneGame, 0, ScenesTransitions.TRANSITION_LENGTH + 500, ScenesTransitions.transitionFinished)
    },
    HideAnimated: function() {
        ScenesTransitions.transitionStarted();
        ScenesTransitions.TRANSITION_EFFECT_IN = Phaser.Easing.Quadratic.Out;
        ScenesTransitions.hideSceneAlpha(grpSceneGame, 0, ScenesTransitions.TRANSITION_LENGTH + 50, ScenesTransitions.transitionFinished)
    },
    createDialogMenu1: function(b, a, c) {
        b = Math.floor(b / 16);
        a = Math.floor(a / 16);
        var e = game.add.bitmapData(16 * b, 16 * a);
        e.draw(game.make.image(0, 0, "dialogImg", 0), 0, 0);
        e.draw(game.make.image(0, 0, "dialogImg", 2), 16 * (b - 1), 0);
        e.draw(game.make.image(0, 0, "dialogImg", 6), 0, 16 * (a - 1));
        e.draw(game.make.image(0, 0, "dialogImg", 8), 16 * (b - 1), 16 * (a - 1));
        for (var d = 1; d < b - 1; d++) e.draw(game.make.image(0, 0, "dialogImg", 1), 16 * d, 0), e.draw(game.make.image(0, 0, "dialogImg", 7), 16 * d, 16 * (a - 1));
        for (d = 1; d < a - 1; d++) e.draw(game.make.image(0, 0, "dialogImg",
            3), 0, 16 * d), e.draw(game.make.image(0, 0, "dialogImg", 5), 16 * (b - 1), 16 * d);
        for (d = 1; d < a - 1; d++)
            for (var f = 1; f < b - 1; f++) e.draw(game.make.image(0, 0, "dialogImg", 4), 16 * f, 16 * d);
        if (null != c) game.cache.addBitmapData(c, e);
        else return e
    },
    createBtnImg: function(b, a, c, e, d) {
        var f = game.add.bitmapData(50, 50);
        f.draw(game.make.image(0, 0, b, a), 0, 0);
        f.draw(game.make.image(0, 0, c, e), 5, 5);
        void 0 === e && f.draw(game.make.image(0, 0, c), 25, 8);
        if (null != d) game.cache.addBitmapData(d, f);
        else return f
    },
    createBtnTxt: function(b, a, c, e) {
        b = new Phaser.Text(game,
            a, c, e, {
                font: "25px gameFont",
                fill: "#FFFFFF"
            });
        b.anchor.x = getCorrectAnchorX(b, .5);
        b.anchor.y = getCorrectAnchorY(b, .5);
        b.shadowOffsetX = 2;
        b.shadowOffsetY = 2;
        b.shadowColor = "#293E07";
        b.shadowFill = "#293E07";
        return b
    },
    ResumeGame: function() {
        gameRunning = !0;
        gamePaused = !1
    }
};
var SceneLogo = function() {
    SceneLogo.instance = this;
    this.create()
};
SceneLogo.instance = null;
SceneLogo.prototype = {
    create: function() {
        grpSceneLogo = game.add.group();
        grpSceneLogo.name = "SceneLogo";
        imgLogo = game.add.sprite(game.width >> 1, (game.height >> 1) / 2, "logo");
        imgLogo.anchor.set(.5);
        grpSceneLogo.add(imgLogo);
        grpSceneLogo.visible = !1
    },
    onResolutionChange: function() {
        imgLogo.position.setTo(game.width >> 1, (game.height >> 1) / 2)
    },
    ShowAnimated: function() {
        ScenesTransitions.showSceneAlpha(grpSceneLogo)
    },
    HideAnimated: function() {
        ScenesTransitions.hideSceneAlpha(grpSceneLogo)
    }
};

SoundManager = function(b) {
    this.game = b;
    try {
        this.musicPlaying = this.soundPlaying = SOUNDS_ENABLED, null != getProfileVar("msc") && (this.musicPlaying = SOUNDS_ENABLED && !0 === getProfileVar("msc")), this.soundPlaying = this.musicPlaying
    } catch (a) {
        this.musicPlaying = this.soundPlaying = SOUNDS_ENABLED
    }
    this.music = [];
    this.sounds = [];
    this.prevSoundPlayed = this.actualMusic = null
};
SoundManager.prototype = {
    constructor: SoundManager,
    create: function() {
        this.addMusic("music_menu", .9, !0);
        this.addSound("game_over", .8);
        this.addSound("tileSelect", .8);
        this.addSound("tile_select", .8);
        this.addSound("undo_loaded", .8);
        this.addSound("undo_use", .8);
        this.addSound("1rowDestroy", .8);
        this.addSound("2rowDestroy", .8);
        this.addSound("3rowDestroy", .8);
        this.addSound("4rowDestroy", .8);
        this.addSound("5rowDestroy", .8);
        this.addSound("6rowDestroy", .8);
        game.input.onDown.addOnce(function() {
            if (soundManager.musicPlaying) try {
                game.sound.context.resume()
            } catch (b) {}
        })
    },
    addMusic: function(b, a, c) {
        void 0 === c && (c = !1);
        this.music[b] = game.add.audio(b, a, c)
    },
    addSound: function(b, a, c) {
        void 0 === c && (c = !1);
        this.sounds[b] = game.add.audio(b, a, c)
    },
    playMusic: function(b, a) {
        void 0 === a && (a = !1);
        if (b != this.actualMusic || a) this.actualMusic = b;
        if (this.musicPlaying) {
            for (var c in this.music) "contains" != c && (c == this.actualMusic ? this.music[c].play() : this.music[c].stop());
            try {
                game.sound.context.resume()
            } catch (e) {}
        }
    },
    playSound: function(b) {
        if (this.soundPlaying) {
            try {
                this.sounds[b].play()
            } catch (a) {
                LOG("Failed to play sound : " +
                    b)
            }
            try {
                game.sound.context.resume()
            } catch (c) {}
        }
    },
    pauseMusic: function() {
        if (this.musicPlaying)
            for (var b in this.music) "contains" != b && b == this.actualMusic && this.music[b].pause()
    },
    resumeMusic: function() {
        if (this.musicPlaying) {
            for (var b in this.music) "contains" != b && b == this.actualMusic && this.music[b].resume();
            try {
                game.sound.context.resume()
            } catch (a) {}
        }
    },
    stopMusic: function() {
        for (var b in this.music) "contains" != b && this.music[b].stop()
    },
    toggleMusic: function(b) {
        this.musicPlaying ? (this.soundPlaying = this.musicPlaying = !1, this.stopMusic()) : (this.soundPlaying = this.musicPlaying = !0, this.playMusic(b));
        try {
            saveAllGameData()
        } catch (a) {}
    },
    toggleSounds: function() {
        if (this.soundPlaying) {
            this.soundPlaying = !1;
            for (var b in this.sounds) "contains" != b && this.sounds[b].stop()
        } else this.soundPlaying = !0;
        try {
            saveAllGameData()
        } catch (a) {}
    }
};

var SOUNDS_ENABLED = !0,
    LANG = "en",
    GAME_OVER_LOSE = 0,
    GAME_OVER_WIN = 1,
    GAME_OVER_BY_USER = 2,
    RUNNING_ON_WP = -1 < navigator.userAgent.indexOf("Windows Phone");
RUNNING_ON_WP && (SOUNDS_ENABLED = !1);
Phaser.Device._initialize();
var RUNNING_ON_DESKTOP = Phaser.Device.desktop,
    RUNNING_ON_IOS = !1,
    userAgent = navigator.userAgent || navigator.vendor || window.opera;
if (userAgent.match(/iPad/i) || userAgent.match(/iPhone/i) || userAgent.match(/iPod/i)) RUNNING_ON_IOS = !0;
var ANIMATION_CUBIC_IO = Phaser.Easing.Cubic.InOut,
    TILE_SIZE_BIG = 48,
    TILE_SIZE_SMALL = 20,
    BOARD_SIZE = 8,
    score = 0,
    bestScore = 0,
    sound = !0,
    tutorial = !0,
    tutorialStage = 1,
    tmp_sprites = [];
Array.prototype.contains = function(b) {
    for (var a = this.length; a--;)
        if (this[a] === b) return !0;
    return !1
};

function getSpriteFrameWithinAtlas(b, a, c) {
    b.frameName = a + "_" + c + ".png";
    return b
}

function makeSprite(b, a, c, e) {
    return c = game.make.sprite(b, a, c, e || 0)
}

function LOG(b) {}

function getCorrectAnchorX(b, a) {
    return Math.round(b.width * a) / b.width
}

function getCorrectAnchorY(b, a) {
    return Math.round(b.height * a) / b.height
}
String.prototype.replaceAll = function(b, a) {
    return this.split(b).join(a)
};

function showDiv(b, a) {
    null == a && (a = !1);
    if (!game.device.desktop || a) document.getElementById(b).style.display = "block"
}

function hideDiv(b, a) {
    null == a && (a = !1);
    if (!game.device.desktop || a) document.getElementById(b).style.display = "none"
}

function reloadPage() {
    window.location.reload(!0)
};

function AddButtonEvents(b, a, c, e, d) {
    void 0 === d && (d = null);
    b.inputEnabled = !0;
    b.buttonPressed = !1;
    b.onInputOut = e;
    b.onInputUp = d;
    b.events.onInputDown.add(ButtonOnInputDown, {
        button: b,
        callback: a
    });
    b.events.onInputOver.add(c, {
        button: b
    });
    b.events.onInputOut.add(e, {
        button: b
    });
    null != d && b.events.onInputUp.add(d, {
        button: b
    })
}

function ButtonOnInputDown() {
    ScenesTransitions.transitionActive || (this.button.hasOwnProperty("spriteHighlighted") && (this.button.spriteHighlighted.tint = 16777215), this.button.tint = 16777215, this.callback(), this.button.onInputOut(this.button), this.button.buttonPressed = !0, this.button.buttonPressedTime = game.time.totalElapsedSeconds())
}

function ButtonOnInputOver(b) {
    b = b || this.button;
    Phaser.Device.desktop && (void 0 === b.overFrame ? (b.hasOwnProperty("spriteHighlighted") && (b.spriteHighlighted.tint = 10066329), b.tint = 10066329) : b.frameName = b.overFrame, b.cachedTint = -1)
}

function ButtonOnInputOut(b) {
    b = b || this.button;
    if (Phaser.Device.desktop && (void 0 === b.outFrame ? (b.hasOwnProperty("spriteHighlighted") && (b.spriteHighlighted.tint = 16777215), b.tint = 16777215) : b.frameName = b.outFrame, b.cachedTint = -1, b.buttonPressed && (b.buttonPressed = !1, null != b.onInputUp))) b.onInputUp(b)
};
var IMAGE_FOLDER = "images/";

function loadSplash(b) {
    b.load.image("inlogic_logo", "" + IMAGE_FOLDER + "inl.png");
    b.load.image("logo", "" + IMAGE_FOLDER + "logo.png")
}

function loadImages(b) {
    b.load.spritesheet("playBtn", "" + IMAGE_FOLDER + "play.png", 165, 78, 2);
    b.load.image("leafs", "" + IMAGE_FOLDER + "list.png");
    b.load.image("icon", "" + IMAGE_FOLDER + "icon_bg.png");
    b.load.image("board", "" + IMAGE_FOLDER + "board.png");
    b.load.image("cup", "" + IMAGE_FOLDER + "cup.png");
    b.load.image("ribbon", "" + IMAGE_FOLDER + "ribbon.png");
    b.load.image("hand", "" + IMAGE_FOLDER + "hand.png");
    b.load.spritesheet("dialogImg", "" + IMAGE_FOLDER + "dialog_bg.png",
        16, 16);
    b.load.spritesheet("flags", "" + IMAGE_FOLDER + "language.png", 100, 100, 6);
    b.load.spritesheet("menuBtn", "" + IMAGE_FOLDER + "menu_button.png", 90, 55, 2);
    b.load.spritesheet("longMenuBtn", "" + IMAGE_FOLDER + "long_button.png", 250, 55, 2);
    b.load.spritesheet("tilesSmall", "" + IMAGE_FOLDER + "tiles_set_small.png", 20, 20, 6);
    b.load.spritesheet("tiles2", "" + IMAGE_FOLDER + "tiles_set2.png", TILE_SIZE_BIG, TILE_SIZE_BIG, 6);
    b.load.spritesheet("tiles", "" + IMAGE_FOLDER + "tiles_set.png", TILE_SIZE_BIG,
        TILE_SIZE_BIG, 6);
    b.load.spritesheet("tilesSmall2", "" + IMAGE_FOLDER + "tiles_set_small2.png", 20, 20, 6);
    b.load.spritesheet("icons", "" + IMAGE_FOLDER + "icons.png", 40, 40, 12);
    b.load.spritesheet("particle", "" + IMAGE_FOLDER + "particle.png", 50, 50, 3);
    b.load.spritesheet("undo", "" + IMAGE_FOLDER + "undo_bg.png", 80, 75, 2)
}

function loadSounds(b) {
    b.load.audio("music_menu", ["audio/ambient-background-1st_min_loop.ogg", "audio/ambient-background-1st_min_loop.mp3"]);
    b.load.audio("game_over", ["audio/GAME_OVER_harp-spell-classic_GywRmrNd.ogg", "audio/GAME_OVER_harp-spell-classic_GywRmrNd.mp3"]);
    b.load.audio("tile_select", ["audio/menu-click1.ogg", "audio/menu-click1.mp3"]);
    b.load.audio("undo_loaded", ["audio/undo_nabitie.ogg", "audio/undo_nabitie.mp3"]);
    b.load.audio("undo_use", ["audio/undo_pouzitie.ogg", "audio/undo_pouzitie.mp3"]);
    b.load.audio("tileSelect", ["audio/tile_uchopenie.ogg", "audio/tile_uchopenie.mp3"]);
    b.load.audio("1rowDestroy", ["audio/riadok1_destroy.ogg", "audio/riadok1_destroy.mp3"]);
    b.load.audio("2rowDestroy", ["audio/riadok2_destroy.ogg", "audio/riadok2_destroy.mp3"]);
    b.load.audio("3rowDestroy", ["audio/riadok3_destroy.ogg", "audio/riadok3_destroy.mp3"]);
    b.load.audio("4rowDestroy", ["audio/riadok4_destroy.ogg",
        "audio/riadok4_destroy.mp3"
    ]);
    b.load.audio("5rowDestroy", ["audio/riadok5a_destroy.ogg", "audio/riadok5a_destroy.mp3"]);
    b.load.audio("6rowDestroy", ["audio/riadok6a_destroy.ogg", "audio/riadok6a_destroy.mp3"])
};
var resolutionX = 480,
    resolutionY = 800,
    GAME_FONT = "gameFont",
    isIOS = !1,
    userAgent = navigator.userAgent || navigator.vendor || window.opera;
if (userAgent.match(/iPad/i) || userAgent.match(/iPhone/i) || userAgent.match(/iPod/i)) isIOS = !0;
var parentElement = null,
    config = {
        width: resolutionX,
        height: resolutionY,
        renderer: Phaser.CANVAS,
        enableDebug: !0,
        antialias: !0,
        forceSetTimeOut: !1,
        transparent: !0,
        parent: parentElement
    },
    game;

function phaserInit() {
    game = new Phaser.Game(config);
    game.forceSingleUpdate = !0;
    game.state.add("SplashState", Splash);
    game.state.add("PreloadState", Preloader);
    game.state.add("GameState", GameState);
    game.state.start("SplashState");

}
phaserInit();
RUNNING_ON_IOS || (document.addEventListener("touchstart", function(b) {
    b.preventDefault()
}), document.addEventListener("touchmove", function(b) {
    b.preventDefault()
}));
window.addEventListener("touchend", function() {
    if (null !== game) try {
        "running" !== game.sound.context.state && game.sound.context.resume()
    } catch (b) {}
}, !1);
window.addEventListener("contextmenu", function(b) {
    b.preventDefault()
});
document.documentElement.style.overflow = "hidden";
document.body.scroll = "no";

function setBG() {
    document.body.style.backgroundImage = "url('images/bg.png')";
    document.body.style.backgroundSize = window.innerWidth + "px " + window.innerHeight + "px"
}
setBG();
window.addEventListener("resize", setBG);

function isPortrait() {
    switch (window.orientation) {
        case 0:
        case 180:
            return !0
    }
    return !1
};
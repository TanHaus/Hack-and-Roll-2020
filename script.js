let Player = {
    // Variables
    'name': 'John',
    'currentStage': 1,
    'currentEpisode': 1,
    'wealth': 50, //determines the radius of Particles
    'happiness': 50, //determines the saturation and luminance of the Particles
    'health': 50, //determines the inital velocity and acceleration of the Particles
    'currentSceneSectionReference': null,
    'decisionWrapper': null,
    'episodeContainerReference': null,
    'upperContainerReference': null,
    

    // Methods
    setName: function(name) {
        Player.name = name
    },
    setSex: function(sex) {
        Player.sex = sex
    },
    proceedStage: function() {
        Player.currentStage += 1
    },
    increasePoints: function(value) {
        Player.points += value
    },
    clearUpperContainer: function() {
        Player.upperContainerReference.firstChild.remove()
    },
    updateWealth: function(value) {
        Player.wealth += value
        if(Player.wealth < 0) Player.wealth = 0
    },
    updateHappiness: function(value) {
        Player.happiness += value
        if(Player.happiness < 0) Player.happiness = 0
    },
    updateHealth: function(value) {
        Player.health += value
        if(Player.health < 0) Player.health = 0
    },
    isGameOver: function() {
        return !Boolean(Player.wealth * Player.happiness * Player.health)
    }
}

let bodyHTML = document.querySelector('body')
// Create a container for each mod and the viz canvas
let container = document.createElement('section')
container.classList.add('biggestContainer')

let music = null

function updateMusic() {
    if(music) {
        music.pause();
        music.remove();
    }
    music = new Audio('./assets/'+getMusic())
    bodyHTML.append(music)
    music.play()
}

let particleArray = []

/**
 * Class Vector
 */
class Vector {
    /**
     * Constructor
     * @param {number} x - x componenet
     * @param {number} y - y component
     */
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    /**
     * Add another vector
     * @param {Vector} v2 - Another vector
     */
    add(v2) {
        this.x += v2.x;
        this.y += v2.y;
    }
    /**
     * Minus another vector
     * @param {Vector} v2 - Another vector
     */
    sub(v2) {
        this.x -= v2.x;
        this.y -= v2.y;
    }
}

/**
 * Particle Class
 */
class Particle {
    constructor(x, y) {
        this.acceleration = new Vector(0, visualizer.particleAcceleration)
        this.velocity = new Vector((Math.random()*2-1)*visualizer.particleVelocity, -Math.random())
        this.position = new Vector(x, y)
        this.lifespan = visualizer.particleLifespan
        this.radius = visualizer.particleRadius + 5
        this.lineWidth = 1
        this.color = `hsl(${Math.random()*360}, ${visualizer.particleSaturation}%, ${visualizer.particleLight}%)`
    }
    run(vizCtx) {
        this.update();
        this.display(vizCtx);
    }
    update() {
        this.position.add(this.velocity);
        this.velocity.add(this.acceleration);
        this.lifespan -= 1;
        if(this.lifespan == 0) {
            particleArray.splice(particleArray.indexOf(this), 1)
        }
        
    }
    display(vizCtx) {
        vizCtx.save()
        vizCtx.translate(this.position.x, this.position.y)

        vizCtx.beginPath()
        vizCtx.arc(0, 0, this.radius, 0, Math.PI * 2)
        vizCtx.lineWidth = this.lineWidth
        vizCtx.strokeStyle = `rgba(255, 255, 255, ${this.lifespan/100})`
        vizCtx.stroke()
        vizCtx.fillStyle = this.color
        vizCtx.globalAlpha = this.lifespan/100
        vizCtx.fill()
        
        vizCtx.restore()
    }
}

let visualizer = {
    vizCanvas: null,
    vizCtx: null,
    canvasWidth: 0,
    canvasHeight: 0,
    animationRequestId: 0,
    particleColor: '',
    particleRadius: 0,
    particleAcceleration: 0,
    particleVelocity: 0,
    particleLifespan: 100,
    particleSaturation: '',
    particleLight: '',
    

    setUp: function() {
        let canvas = document.createElement('canvas')
        canvas.classList.add('viz')

        visualizer.vizCanvas = canvas
        visualizer.vizCtx = canvas.getContext('2d')

        visualizer.particleSaturation = visualizer.particleLight = Player.health
        visualizer.particleRadius = Player.wealth/10
        visualizer.particleAcceleration = Player.happiness/1000
        visualizer.particleVelocity = Player.happiness/50
    },
    updateDimension: function() {
        visualizer.canvasHeight = visualizer.vizCanvas.height = visualizer.vizCanvas.clientHeight
        visualizer.canvasWidth = visualizer.vizCanvas.width = visualizer.vizCanvas.clientWidth
    },
    clear: function() {
        let ctx = visualizer.vizCtx
            width = visualizer.canvasWidth
            height = visualizer.canvasHeight
     
        ctx.clearRect(0,0,width,height)
    },
    run: function() {
        function vizLoop() {
            visualizer.clear()
            for (let i=0; i<particleArray.length; i++) {
                particleArray[i].run(visualizer.vizCtx)
            }
            particleArray.push(new Particle(visualizer.canvasWidth/2,30))
            
            visualizer.animationRequestId = requestAnimationFrame(vizLoop)
        }

        visualizer.animationRequestId = requestAnimationFrame(vizLoop)
    }, 
    stop: function() {
        cancelAnimationFrame(visualizer.animationRequestId)
    }
}

// Load story script from the json file
let storyScript
let loadingPromise = fetch('./storyScriptPython.json')
    .then((response) => {
        return response.json()
    }).then((jsonFile) => {
        storyScript = jsonFile
    })

function createDialogue(episodeObject) { //episode = storyScript.stage#[#] 
    dialogueBlock = episodeObject.dialogue


    charToColor = {
        "John"      : "rgba(0, 102, 12, 0.95)", //emerald
        "Mary"      : "rgba(0, 27, 97, 0.95)", //navy
        "Waiter"    : "rgba(86, 61, 0, 0.95)", //brown
        "Peter"     : "rgba(225, 119, 0, 0.95)", //orange
        "TV"        : "rgba(36, 36, 36, 0.95)", //grey
        "Elsa"      : "rgba(135, 0, 184, 0.95)", //violet
        "Karen"     : "rgba(0, 102, 122, 0.95)", //torquoise
        "Oliver"    : "rgba(0, 191, 230, 0.95)",//light blue
        "Rachel"    : "rgba(225, 26, 121, 0.95)", //pink
        "Chris"     : "rgba(0, 194, 10, 0.95)"//light green
    }
    let episodeContainer = document.createElement('section')
    episodeContainer.classList.add('episodeContainer')
    episodeContainer.style.backgroundImage = `url('./assets/bg${episodeObject["id"]}.jpg')`
    
    //home button
    let homeButton = document.createElement("input");
    homeButton.setAttribute("type","image");
    homeButton.classList.add("homeButton");
    homeButton.src = './assets/icon.jpeg'; 
    homeButton.onclick = function(){
        Player.upperContainerReference.remove();
        container.remove();
        visualizer.vizCanvas.remove();
        Player.wealth = 50; 
        Player.happiness = 50; 
        Player.health = 50; 
        Player.currentSceneSectionReference = null; 
        Player.episodeContainerReference = null; 
        Player.upperContainerReference = null; 
        Player.currentEpisode = 1; 
        Player.currentStage = 1; 
        startMenuScreen();
    }
    //dialogue line and its wrapper 
    let dialogueBox = document.createElement('section')
    dialogueBox.classList.add("dialogueBox");

    let dialogueLine = document.createElement('p')
    dialogueLine.classList.add("dialogueLine")
    dialogueBox.appendChild(dialogueLine)

    //name and its wrapper 
    let charName = document.createElement('h2');
    charName.classList.add("charName");

    let charNameContainer = document.createElement('section')
    charNameContainer.append(charName)
    charNameContainer.classList.add('charNameContainer')

    //character
    let characters = {}
    let avatarContainer = document.createElement('section')
    avatarContainer.classList.add('avatarContainer')

    for(key in episodeObject.characters) {
        let name = episodeObject.characters[key]

        let avatar = document.createElement('img')
        avatar.classList.add("avatar");
        avatar.src=`./assets/${name}.png`

        avatarContainer.append(avatar)
        characters[name] = avatar
    }

    let continueButton = document.createElement('button')
    continueButton.classList.add('continueButton')
    continueButton.textContent = '>'
    continueButton.onclick = function() {
        i += 1
        if (i == dialogueBlock.length) {
            for(key in characters) {
                characters[key].remove()
            }
            charName.remove()
            dialogueBox.remove()
            continueButton.remove()
            decisionBlock = createDecision(episodeObject)
            episodeContainer.append(decisionBlock)
        }
        updateFrame(i)
    }
    
    function updateFrame(i) {
        // handle the avatars
        let activeCharacter = dialogueBlock[i].name
        for(key in characters) {
            characters[key].classList.remove('activeCharacter')
        }
        characters[activeCharacter].classList.add('activeCharacter')

        // handle the paragraph
        j = 0
        clearTimeout(timeoutid)
        let dialogueContent = dialogueBlock[i].text;
        charName.textContent = dialogueBlock[i].name;
        charName.style.backgroundColor = charToColor[charName.textContent];

        dialogueLine.textContent = ''
        typeWriter(dialogueLine, dialogueContent);
    }
    let j = 0
    let timeoutid = 0;   
    function typeWriter(line, text) {
        if (j < text.length) {
          line.textContent += text[j];
          j++;
          timeoutid = setTimeout(() => typeWriter(line, text), 20);
        }
    }
    
    let i = 0
    updateFrame(i)
    episodeContainer.append(avatarContainer, dialogueBox, charName, continueButton,homeButton)

    return episodeContainer
}

function loadEpisode(episode = Player.currentEpisode, stage = Player.currentStage) {
    updateMusic()
    episodeObject = storyScript[`stage${stage}`][episode - 1]
    Player.clearUpperContainer()
    Player.upperContainerReference.append(createDialogue(episodeObject))
}

function loadTitleAndOpening(episode = Player.currentEpisode, stage = Player.currentStage) {
    if(music) {
        music.pause();
        music.remove();
    }
    music = new Audio("./assets/Opening.mp3");
    music.play();
    if(Player.isGameOver()) {
        explode()
    }


    episodeObject = storyScript[`stage${stage}`][episode - 1]
    let title = episodeObject.title
        opening = episodeObject.opening
    
    let group = document.createElement('section')
    group.classList.add('episodeContainer')

    let episodeTitle = document.createElement('h1')
    episodeTitle.setAttribute("style", "padding: 10vh 0 0 0")
    episodeTitle.textContent = title

    let episodeOpening = document.createElement('p')
    episodeOpening.classList.add("openingText")

    let openingButton = document.createElement('button')
    openingButton.textContent = 'Next...'
    openingButton.onclick = () => {
        // clearTimeout(timeoutid)
        if(music) {
            music.pause();
            music.remove();
        }
        Player.upperContainerReference.classList.add('addFadeOut')
        setTimeout(() => {
            Player.upperContainerReference.classList.remove('addFadeOut')
            loadEpisode()
        }, 1000)
    }

    let j = 0
    let timeoutid = 0;   
    function typeWriter(textObject, text) {
        if (j < text.length) {
          textObject.textContent += text[j];
          j++;
          timeoutid = setTimeout(() => typeWriter(textObject, text), 25);
        } else {
            // group.append(openingButton)
        }
    }
    
    typeWriter(episodeOpening, opening)

    group.append(episodeTitle, episodeOpening, openingButton)
    Player.upperContainerReference.append(group)
}

function startMenuScreen() {
    if (music) {
        music.pause();
        music.remove();
    }
    music = new Audio("./assets/Home.mp3");
    music.play();
    //add game background
    let background = document.createElement("section")
    background.classList.add("background")
    bodyHTML.appendChild(background)

    //add menu
    let menu = document.createElement("section")
    menu.classList.add("menu")
    background.appendChild(menu)

    //add components of menu - title and button. 
    let gameTitle = document.createElement("h1")
    gameTitle.textContent = "Another Singaporean Dream"
    gameTitle.setAttribute("style", "font-size: 42px")

    //button
    let stageArray = ["1: Young Adult", "2: Working Adult", "3: Silver Years"]
    
    let startButton = document.createElement("button");
    startButton.textContent = "Play"
    startButton.onclick = () => {
        menu.classList.add('addFadeOut')
        setTimeout(() => {
            menu.classList.remove('addFadeOut')
            setUpPrologue()
            // setUpStage()
        }, 1000)
    }

    let optionButton = document.createElement("button");
    optionButton.textContent = "Choose Episode"
    optionButton.onclick = function (){
        let optionsContainer = document.createElement('section')
        optionsContainer.classList.add('optionsContainerButtons')

        for (let i=0; i<3;i++){
            let btn = document.createElement("h2")
            // optionsContainer.setAttribute("style", "display: inline");
            optionsContainer.append(btn)
            
            btn.textContent = stageArray[i];
            btn.classList.add("stageButton");

            for(let j=0;j<3;j++){
                let button = document.createElement("button")
                button.textContent = "Ep" + storyScript[`stage${i+1}`][j].episode
                button.classList.add('episodeButton')
                // btn.setAttribute("style", "display: infinite")
                button.onclick = function(){
                    setUpStage();
                    Player.clearUpperContainer()
                    Player.currentStage = i+1; 
                    Player.currentEpisode = j+1; 
                    loadTitleAndOpening();
                }
                optionsContainer.append(button)
            }
        }
        menu.append(optionsContainer)
    }
    
    let fullscreenButton = document.createElement('button')
    fullscreenButton.textContent = 'Fullscreen'
    fullscreenButton.onclick = () => {
        document.documentElement.requestFullscreen()
        document.documentElement.webkitRequestFullscreen()
    }
    
    async function addButton() {
        await loadingPromise
        menu.append(gameTitle,startButton, fullscreenButton,optionButton); 
    }

    addButton()

    Player.currentSceneSectionReference = background
}
function setUpPrologue() {
    Player.currentSceneSectionReference.remove()
    let bgBlack = document.createElement("section")
    bgBlack.classList.add("bgBlack")
    bodyHTML.appendChild(bgBlack)
    
    prologueBlock = ["Navigate through life and make financial choices.",
    "Will you be financially independent?", 
    "Will you be able to live well?",
    "And one more thing.",
    "You are John."]

    let i = 0;
    function setPrologueLine() {
        if(i<prologueBlock.length) {
            let prologueLine = document.createElement('p')
            prologueLine.classList.add('prologue')
            prologueLine.textContent = prologueBlock[i]
            prologueLine.classList.add('addFadeIn')
            bgBlack.append(prologueLine)
            i += 1
            setTimeout(setPrologueLine, 2000)
        }
        else {
            let startButton = document.createElement("button");
            startButton.textContent = "Start"
            startButton.onclick = setUpStage
            bgBlack.append(startButton)
        }

    }
    setPrologueLine()
    
    Player.currentSceneSectionReference = bgBlack
}

function setUpStage() {
    Player.currentSceneSectionReference.remove()
    visualizer.setUp()
    let upperContainer = document.createElement('section')
    Player.upperContainerReference = upperContainer
    container.append(upperContainer, visualizer.vizCanvas)

    bodyHTML.append(container)

    visualizer.updateDimension()
    visualizer.run()

    loadTitleAndOpening()
}

function nextEpisode() {
    if(Player.currentEpisode<3) {
        Player.currentEpisode += 1

    } else {
        Player.currentEpisode = 1
        
        if(Player.currentStage<3) {
            Player.currentStage += 1
        
        } else {
            setUpReportCard()
            return
        }
    }
    
    Player.clearUpperContainer()
    loadTitleAndOpening()
}

function createButton(option){
    //this function generate decision buttons
    let button = document.createElement("button");
    button.classList.add("decButton");
    button.textContent = option.desc;
    //add event handler 
    button.onclick = function(){
        //update Player's fields
        Player.updateHealth(option.point.Health*2); 
        Player.updateWealth(option.point.Wealth*2); 
        Player.updateHappiness(option.point.Happiness*2); 

        
        visualizer.particleSaturation = visualizer.particleLight = Player.health
        visualizer.particleRadius = Player.wealth/10
        visualizer.particleAcceleration = Player.happiness/1000
        visualizer.particleVelocity = Player.happiness/50
        
        //advance to outcome page 
        Player.decisionWrapper.remove();
        Player.decisionWrapper = null; 
        setOutcomePage(option);
    }
    return button; 
}

function createDecision(episode){ //episode = storyScript.stage#[#]
    //this function generate the 3 decisions in an episode. 
    if(music) {
        music.pause();
        music.remove();
    }
    music = new Audio("./assets/Decision.mp3");
    music.play();
    //wrapper for everything 
    let wrapper = document.createElement("section");
    wrapper.classList.add("wrapper");

    //title and its wrapper 
    let title = document.createElement("h1");
    title.classList.add("decTitle");
    title.textContent = "What should I do?";

    let titWrapper = document.createElement("section");
    titWrapper.classList.add("titWrapper");
    titWrapper.appendChild(title);

    //subtitle and its wrapper 
    let subTitle = document.createElement("p");
    subTitle.classList.add("subTitle");
    subTitle.textContent = episode.decision; 

    let subWrapper = document.createElement("section");
    subWrapper.classList.add("subWrapper");
    subWrapper.appendChild(subTitle);

    //button and its wrapper 
    let buttonWrapper = document.createElement("section");
    buttonWrapper.classList.add("buttonWrapper");

    for(let i=0; i<3; i++){
        buttonWrapper.appendChild(createButton(episode.options[i]));
    }
    wrapper.append(titWrapper,subWrapper,buttonWrapper);
    Player.decisionWrapper = wrapper; 
    // bodyHTML.append(wrapper);

    // animation
    Player.upperContainerReference.classList.add('addFlash')
    setTimeout(() => Player.upperContainerReference.classList.remove('addFlash'), 1000)

    if(Player.currentEpisode==3 && Player.currentStage==3) {
        if(Player.isGameOver()){
            explode()
        }
    }

    return wrapper; 
}

function setOutcomePage(option){
    let wrapper = document.createElement("section");
    wrapper.classList.add("wrapper");

    let title = document.createElement("h1");
    title.classList.add("decTitle");
    title.textContent = "Outcome";
    
    let button = document.createElement('button')
    button.textContent = 'Next'
    button.onclick = nextEpisode

    //subtitle and its wrapper 
    let subTitle = document.createElement("p");
    subTitle.classList.add("subTitle");
    subTitle.textContent = option.outcome;
    subTitle.classList.add('addFadeIn')
    setTimeout(() => subTitle.classList.remove('addFadeIn'), 1000)

    let subWrapper = document.createElement("section");
    subWrapper.classList.add("subWrapper");
    subWrapper.appendChild(subTitle);
    
    //append
    wrapper.append(title,subWrapper,button);
    Player.clearUpperContainer()
    Player.upperContainerReference.append(wrapper);
    return wrapper; 
}

function explode() {
    if(music) {
        music.pause();
        music.remove();
    }
    music = new Audio("./assets/Explosion.mp3");
    music.play();
    let height = Math.max(
        document.documentElement.clientHeight, 
        document.documentElement.scrollHeight)
    let i = 0

    function growCanvas() {
        if(visualizer.canvasHeight < height) {
            i++
            canvasHeight = (40*1.001**i)
            
            container.firstChild.style.height = `${100-canvasHeight}%`

            visualizer.vizCanvas.style.height = `${canvasHeight}%`
            visualizer.updateDimension()

            visualizer.lifespan = Math.round(visualizer.lifespan*1.02)
            visualizer.particleAcceleration *= 1.003
            visualizer.particleVelocity *= 1.003
            visualizer.particleRadius *= 1.003

            setTimeout(growCanvas, 16)
        } else {
            container.firstChild.remove()
            container.classList.add('addFlash')
            setUpReportCard()
        }
    }

    container.firstChild.classList.add('addSlowFadeOut')
    growCanvas()
}

function setUpRadarChart() {
    let radarChart = document.createElement("canvas");
    radarChart.setAttribute("id", "myChart");
    radarChart.setAttribute("width", "100%");
    radarChart.setAttribute("height", "90%");
    radarChart.classList.add("radar")

    var ctx = radarChart.getContext('2d');
    new Chart(ctx, {
    type: 'radar',
    data: {
        labels: ['Wealth', 'Health', 'Happiness'],
        datasets: [{
            label: 'Points',
            backgroundColor: 'rgb(153, 204, 255, 0.5)',
            borderColor: 'rgb(153, 204, 255)',
            fontSize: 25,
            data: [Player['wealth'], Player['health'], Player['happiness']]
        }]
    },

    options: {
        scale: {
            angleLines: {
                display: false
            },
            ticks: {
                min: 0,
                max: 100,
                stepSize: 20
            },
        },
        legend: {
            labels: {
                fontSize: 16
            }
        },
        title: {
            display: true,
            text: 'Overall Results',
            fontSize: 32,
            padding: 10
        },
    }
    });
    return radarChart
}

function createEndButtons() {
    let endButtonWrapper = document.createElement('section')
    let infoButton = document.createElement('button')
    infoButton.textContent = 'More'
    infoButton.onclick = ""

    // home button
    let restartButton = document.createElement("button");
    restartButton.textContent = "Restart Now"
    restartButton.onclick = function(){
        document.querySelector('section').remove()
        Player.wealth = 50; 
        Player.happiness = 50; 
        Player.health = 50; 
        Player.currentSceneSectionReference = null; 
        Player.episodeContainerReference = null; 
        Player.upperContainerReference = null; 
        Player.currentEpisode = 1; 
        Player.currentStage = 1; 
        startMenuScreen();
        }

    // let restartButton = document.createElement("button")
    // restartButton.onClick = "window.location.href=window.location.href"
    // restartButton.value = "Refresh"
    // restartButton.textContent = "Restart Now"
    

    let quitButton = document.createElement('button')
    quitButton.textContent = 'Quit Game'
    quitButton.onclick = function() {
        if (confirm("Give up Another Singaporean Dream?")) {
          close();
        }
      }

    endButtonWrapper.append(infoButton, restartButton, quitButton)
    return endButtonWrapper
}


function setUpReportCard(){
    if(music) {
        music.pause()
        music.remove()
    }
    music = new Audio('./assets/Ending.mp3')
    music.play()

    container.remove();
    Player.upperContainerReference.remove()
    visualizer.vizCanvas.remove()
    
    let endContainer = document.createElement('section')
    endContainer.append(setUpRadarChart(), createEndButtons())
    bodyHTML.append(endContainer)

    endContainer.classList.add('addZoomInOut')

}

function getMusic(){
    let stage = Player.currentStage,
        episode = Player.currentEpisode

    if((stage==1 && episode ==1) ||(stage==3 && episode ==1)){
        return "Happy2.mp3"; 
    } else if ((stage==1 && episode ==2) ||(stage==2 && episode ==3)||(stage==3 && episode ==3)){
        return "Cool.mp3"; 
    } else if((stage==1 && episode ==3) ||(stage==2 && episode ==2)){
        return "Upbeat.mp3"; 
    } else {
        return "Lively.mp3";
    }
}

startMenuScreen()
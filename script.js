let Player = {
    // Variables
    'name': 'John',
    'sex': 'unidentified',
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
    }
}

let bodyHTML = document.querySelector('body')
// Create a container for each mod and the viz canvas
let container = document.createElement('section')
container.classList.add('biggestContainer')

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
        this.radius = visualizer.particleRadius
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

        visualizer.particleSaturation = visualizer.particleLight = Player.happiness
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

function createDialogue(episodeObject) {
    dialogueBlock = episodeObject.dialogue

    charToColor = {
        "John"      : "rgba(0, 102, 12, 0.95)", //emerald
        "Mary"      : "rgba(0, 27, 97, 0.95)", //navy
        "Waiter"    : "rgba(240, 1184, 0, 0.95)", //gold
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
    episodeObject = storyScript[`stage${stage}`][episode - 1]
    Player.clearUpperContainer()
    Player.upperContainerReference.append(createDialogue(episodeObject))
}

function loadTitleAndOpening(episode = Player.currentEpisode, stage = Player.currentStage) {
    episodeObject = storyScript[`stage${stage}`][episode - 1]
    let title = episodeObject.title
        opening = episodeObject.opening
    
    let group = document.createElement('section')
    group.classList.add('episodeContainer')

    let episodeTitle = document.createElement('h1')
    episodeTitle.textContent = title

    let episodeOpening = document.createElement('p')

    let nextButton = document.createElement('button')
    nextButton.textContent = '...'
    nextButton.onclick = () => {
        // clearTimeout(timeoutid)
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
          timeoutid = setTimeout(() => typeWriter(textObject, text), 50);
        } else {
            // group.append(nextButton)
        }
    }
    
    typeWriter(episodeOpening, opening)

    group.append(episodeTitle, episodeOpening, nextButton)
    Player.upperContainerReference.append(group)
}

function startMenuScreen() {
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
    gameTitle.setAttribute("style", "font-size: 54px")

    //button
    let stageArray = ["1: Young Adult", "2: Working Adult", "3: Silver Years"]
    
    let startButton = document.createElement("button");
    startButton.textContent = "Play"
    startButton.onclick = () => {
        menu.classList.add('addFadeOut')
        setTimeout(() => {
            menu.classList.remove('addFadeOut');
            setUpStage();
        }, 1000)
    }

    let optionButton = document.createElement("button");
    optionButton.textContent = "Choose Episode"
    optionButton.onclick = function (){
        let optionsContainer = document.createElement('section')
        optionsContainer.classList.add('optionsContainerButtons')

        for (let i=0; i<3;i++){
            let btn = document.createElement("section")
            optionsContainer.setAttribute("style", "display: inline")
            optionsContainer.append(btn)
            
            btn.textContent = stageArray[i];
            btn.classList.add("stageButton");

            for(let j=0;j<3;j++){
                let button = document.createElement("button")
                button.textContent = "Ep" + storyScript[`stage${i+1}`][j].episode
                button.classList.add('episodeButton')
                btn.setAttribute("style", "display: infinite")
                button.onclick = function(){
                    setUpStage();
                    Player.clearUpperContainer()
                    loadTitleAndOpening(i+1,j+1);
                }
                btn.append(button)
            }
        }
        menu.append(optionsContainer)
    }
    
    let fullscreenButton = document.createElement('button')
    fullscreenButton.textContent = 'Fullscreen'
    fullscreenButton.onclick = () => document.documentElement.requestFullscreen()
    
    async function addButton() {
        await loadingPromise
        menu.append(gameTitle,startButton, fullscreenButton,optionButton); 
    }

    addButton()

    Player.currentSceneSectionReference = background
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
        Player.health += option.point.Health*10; 
        Player.wealth += option.point.Wealth*10; 
        Player.happiness += option.point.Happiness*10; 

        
        visualizer.particleSaturation = visualizer.particleLight = Player.happiness
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
        }
    }

    container.firstChild.classList.add('addSlowFadeOut')
    growCanvas()
}

function setUpRadarChart(PlayerObject) {

    let radarChart = document.createElement("canvas");
    radarChart.setAttribute("id", "myChart");
    radarChart.setAttribute("width", "100%");
    radarChart.setAttribute("height", "90%");
    radarChart.classList.add("radar")

    bodyHTML.append(radarChart);

    var ctx = radarChart.getContext('2d');
    var chart = new Chart(ctx, {
    type: 'radar',
    data: {
        labels: ['Wealth', 'Health', 'Happiness'],
        datasets: [{
            label: 'Points',
            backgroundColor: 'rgb(153, 204, 255, 0.5)',
            borderColor: 'rgb(153, 204, 255)',
            fontSize: 25,
            data: [Player['wealth'], Player['happiness'], Player['happiness']]
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
}

function createEndButtons() {
    let infoButton = document.createElement('button')
    infoButton.textContent = 'More'
    infoButton.onclick = ""

    let restartButton = document.createElement('button')
    restartButton.textContent = 'Restart Game'
    restartButton.onclick = function() {
        document.body.innerHTML = ""
        startMenuScreen()
    }

    let quitButton = document.createElement('button')
    quitButton.textContent = 'Quit Game'
    quitButton.onclick = function() {
        if (confirm("Give up Another Singaporean Dream?")) {
          close();
        }
      }

    bodyHTML.append(infoButton, restartButton, quitButton)
}

function setUpReportCard(){
    
    container.firstElementChild.remove();
    container.firstElementChild.remove();
    
    setUpRadarChart(Player);
    createEndButtons();

}


// //TESTING
// async function test() {
//     await storyScript; 
//     createDecision(storyScript.stage1[0]);
// }
// // test();
// // startMenuScreen();
// async function testFuck() {
//     await storyScript;
//     setUpModFour()
// }
// // test();
// testFuck()
// setDecisionPage()


startMenuScreen()
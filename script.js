let bodyHTML = document.querySelector('body')

// Create a container for each mod and the viz canvas
let container = document.createElement('container')
let vizCanvas

let ballArray = []

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
        this.acceleration = new Vector(0, 0.05)
        this.velocity = new Vector(Math.random() * 2 - 1, -Math.random())
        this.position = new Vector(x, y)
        this.lifespan = 100
        this.radius = 5
        this.lineWidth = 1
        this.color = 'rgba(256, 256, 256, 1)'
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
            ballArray.splice(ballArray.indexOf(this), 1)
        }
    }
    display(vizCtx) {
        vizCtx.save()
        vizCtx.translate(this.position.x, this.position.y)

        vizCtx.beginPath()
        vizCtx.arc(0, 0, this.radius, 0, Math.PI * 2)
        vizCtx.lineWidth = this.lineWidth
        vizCtx.strokeStyle = `rgba(0,0,0,${this.lifespan/100})`
        vizCtx.stroke()
        
        vizCtx.restore()
    }
    setAcceleration(newValue) {
        this.acceleration = new Vector(0, newValue)
    }
    setRadius(newValue) {
        this.radius = newValue
    }
    setLifespan(newValue) {
        this.lifespan = newValue
    }
    setColor(red, green, blue, alpha) {
        this.color = `rgba(${red}, ${green}, ${blue}, ${alpha})`
    }
}


function vizLoop() {
    let ctx = vizCanvas.getContext('2d')
    ctx.clearRect(0,0,vizCanvas.width,vizCanvas.height)
    
    for (let i=0; i<ballArray.length; i++) {
        ballArray[i].run(ctx)
    }
    ballArray.push(new Particle(vizCanvas.width/2,30))
    
    requestAnimationFrame(vizLoop)
}

// Create the viz canvas
function setUpCanvas() {
    let vizCanvas = document.createElement('canvas')
    vizCanvas.classList.add('viz')
    return vizCanvas
}

function updateCanvas(vizCanvas) {
    vizCanvas.height = vizCanvas.clientHeight
    vizCanvas.width = vizCanvas.clientWidth
}

// Load story script from the json file
let storyScript
let loadingPromise = fetch('./storyScriptPython.json')
    .then((response) => {
        return response.json()
    })
    .then((jsonFile) => {
        storyScript = jsonFile
    })

function createDialogue(episode) {
    dialogueBlock = episode.dialogue
    let episodeContainer = document.createElement('section')
    episodeContainer.classList.add('episodeContainer')
    // episodeContainer.id = 'modFour'

    // dialogueLines = episode.dialogue

    // episodeContainer.style.backgroundImage = "url(`./assets/${dialogueLines.name}.png`)"

    episodeContainer.style.backgroundImage = "url('./assets/asset1.jpg')"
    
    let avatar = document.createElement('img')
    avatar.classList.add("avatar");

    let dialogueLine = document.createElement('p')
    dialogueLine.classList.add("dialogueLine")

    let continueButton = document.createElement('button')
    continueButton.classList.add('continueButton')
    continueButton.textContext = "Click to continue"
    continueButton.onclick = function() {
        i += 1
        if (i == dialogueBlock.length) {
            avatar.remove()
            dialogueLine.remove()
            continueButton.remove()
            decisionBlock = createDecision(episode)
            episodeContainer.append(decisionBlock)
        }
        updateFrame(i)
    }
    
    function updateFrame(i) {
        avatar.setAttribute("src", `./assets/${dialogueBlock[i].name}.png`)
        dialogueLine.textContent = dialogueBlock[i].name + ": " + dialogueBlock[i].text
    }
    
    let i = 0
    updateFrame(i)
    

    episodeContainer.append(avatar, dialogueLine, continueButton)



    // function 
    // continueButton.onclick() = 

    // for (let i = 0; i <= dialogueLines.length; i++) {
    //     // get avatar corresponding to the character
    //     let avatar = document.createElement('img')
    //     avatar.setAttribute("src", `./assets/${dialogueLines.name}.png`)

    //     avatar.classList.add("avatar");

    //     // get a single dialogue line 
    //     let dialogueLine = document.createElement('p')
    //     dialogueLine.textContent = dialogueLines[i]
    //     dialogueLine.classList.add("dialogueLine")

        // episodeContainer.append(avatar, dialogueLine)

    // }
        
    return episodeContainer
}

function createQn(episode) {

}

let Player = {
    // Variables
    'name': 'John',
    'sex': 'unidentified',
    'currentStage': 1,
    'wealth': 0,
    'happiness': 0, 
    'health': 0, 
    'currentSceneSectionReference': null,
    'decisionWrapper': null,
    'episodeContainerReference': null,
    

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
    }
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
    gameTitle.textContent="Game"


    let startButton = document.createElement("button");
    startButton.classList.add("startButton");
    startButton.textContent = "Start Game"
    startButton.onclick = setUpModFour
    
    async function addButton() {
        await loadingPromise
        menu.append(gameTitle,startButton); 
    }

    addButton()

    Player.currentSceneSectionReference = background
}

function setUpModOne() {
    let modOne = document.createElement('section')
    modOne.id = 'modOne'

    Player.currentSceneSectionReference.remove()    // remove the current scene from the DOM
    Player.currentSceneSectionReference = modOne

    return modOne
}

function setUpModTwo() {
    let modTwo = document.createElement('section')
    modTwo.id = 'modTwo'

    Player.currentSceneSectionReference.remove()
    Player.currentSceneSectionReference = modOne

    return modTwo
}

function setUpModThree() {
    let modThree = document.createElement('section')
    modThree.id = 'modThree'

    Player.currentSceneSectionReference.remove()
    Player.currentSceneSectionReference = modOne

    return modThree
}

function setUpModFour() {
    Player.currentStage = 4
    Player.currentSceneSectionReference.remove()

    episode1 = storyScript.stage1[0]
    modFour = createDialogue(episode1)
    Player.episodeContainerReference = modFour

    vizCanvas = setUpCanvas()

    container.append(modFour, vizCanvas)
    
    bodyHTML.appendChild(container)

    // get width and height after attaching to bodyHTML
    updateCanvas(vizCanvas)

    // start the visualizer
    requestAnimationFrame(vizLoop)
    
    Player.currentSceneSectionReference = modFour

    return modFour
}
function createButton(option){
    //this function generate decision buttons
    let button = document.createElement("button");
    button.classList.add("decButton");
    button.textContent = option.desc;
    //add event handler 
    button.onclick = function(){
        //update Player's fields
        Player.health += option.point.Health; 
        Player.wealth += option.point.Wealth; 
        Player.happiness += option.point.Happiness; 
        
        //advance to outcome page 
        Player.decisionWrapper.remove();
        Player.decisionWrapper = null; 
        setOutcomePage(option);
    }
    return button; 
}

function createDecision(episode){ //episode = storyScript.module#[#]
    //this function generate the 3 decisions in an episode. 
    let wrapper = document.createElement("section");
    let title = document.createElement("h1");
    title.classList.add("decTitle");
    title.textContent = "What should I do?";
    wrapper.classList.add("wrapper");
    wrapper.appendChild(title);
    for(let i=0; i<3; i++){
        wrapper.appendChild(createButton(episode.options[i]));
    }
    
    Player.decisionWrapper = wrapper; 
    // bodyHTML.append(wrapper);
    return wrapper; 
}

function setOutcomePage(option){
    let wrapper = document.createElement("section");
    wrapper.classList.add("wrapper");

    let textWrapper = document.createElement("section");
    textWrapper.classList.add("textWrapper");

    let title = document.createElement("h1");
    title.classList.add("decTitle");
    title.textContent = "Outcome";

    let text = document.createElement("p");
    text.classList.add("outcomeP")
    text.textContent = option.outcome; 

    textWrapper.appendChild(text);
    wrapper.append(title,textWrapper);
    Player.episodeContainerReference.append(wrapper);
    return wrapper; 
}

function setUpReportCard() {
    Player.currentSceneSectionReference.remove()

    
}

//TESTING
async function test() {
    await loadingPromise; 
    createDecision(storyScript.stage1[0]);
}
// test();
// startMenuScreen();
async function testFuck() {
    await loadingPromise;
    setUpModFour()
}
// test();
// testFuck()
// setDecisionPage()

startMenuScreen()

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
    constructor(x, y, radius, accelerationY, velocityX) {
        this.acceleration = new Vector(0, accelerationY)
        this.velocity = new Vector((Math.random()*2-1)*velocityX, -Math.random())
        this.position = new Vector(x, y)
        this.lifespan = 100
        this.radius = radius
        this.lineWidth = 1
        this.color = `hsl(${Math.random()*360}, ${Player.happiness}%, ${Player.happiness}%)`
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
        vizCtx.strokeStyle = 'white'
        vizCtx.stroke()
        vizCtx.fillStyle = this.color
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
    color: '',

    setUp: function() {
        let canvas = document.createElement('canvas')
        canvas.classList.add('viz')

        visualizer.vizCanvas = canvas
        visualizer.vizCtx = canvas.getContext('2d')
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
            particleArray.push(new Particle(visualizer.canvasWidth/2,30, Player.health/2, Player.health/100, Player.health/2))
            
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

    let episodeContainer = document.createElement('section')
    episodeContainer.classList.add('episodeContainer')
    episodeContainer.style.backgroundImage = "url('./assets/asset1.jpg')"
    
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


        dialogueLine.textContent = ''
        console.log(dialogueContent)
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
    episodeContainer.append(avatarContainer, dialogueBox, charName, continueButton)

    return episodeContainer
}

let Player = {
    // Variables
    'name': 'John',
    'sex': 'unidentified',
    'currentStage': 1,
    'currentEpisode': 1,
    'wealth': 50, //determines the radius of Particles
    'happiness': 50, //determines the color of the Particles
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

function loadEpisode(episode = Player.currentEpisode, stage = Player.currentStage) {
    episodeObject = storyScript[`stage${stage}`][episode - 1]
    return createDialogue(episodeObject)
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
    gameTitle.textContent = "The Singaporean Dream"

    let startButton = document.createElement("button");
    startButton.classList.add("startButton");
    startButton.textContent = "Start Game"
    startButton.onclick = setUpStage

    let fullscreenButton = document.createElement('button')
    fullscreenButton.textContent = 'Fullscreen'
    fullscreenButton.onclick = () => document.documentElement.requestFullscreen()
    
    async function addButton() {
        await loadingPromise
        menu.append(gameTitle,startButton, fullscreenButton); 
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

    let stageContent = loadEpisode(3, 3)
    Player.upperContainerReference.append(stageContent)

    Player.currentEpisode = 3
    Player.currentStage = 3
}

function nextEpisode() {
    Player.clearUpperContainer()
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
    
    let stageContent = loadEpisode()
    Player.upperContainerReference.append(stageContent)
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

    let subWrapper = document.createElement("section");
    subWrapper.classList.add("subWrapper");
    subWrapper.appendChild(subTitle);
    
    //append
    wrapper.append(title,subWrapper,button);
    Player.clearUpperContainer()
    Player.upperContainerReference.append(wrapper);
    return wrapper; 
}

function setUpRadarChart() {

    let radarChart = document.createElement("canvas");
    radarChart.setAttribute("id", "myChart");
    
    var ctx = radarChart.getContext('2d');
    var chart = new Chart(ctx, {
        // The type of chart we want to create
        type: 'line',

        // The data for our dataset
        data: {
            labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
            datasets: [{
                label: 'My First dataset',
                backgroundColor: 'rgb(255, 99, 132)',
                borderColor: 'rgb(255, 99, 132)',
                data: [0, 10, 5, 2, 20, 30, 45]
            }]
        },

        // Configuration options go here
        options: {}
    });

    container.append(radarChart);
}

function setUpReportCard(){
    
    container.firstElementChild.remove();
    container.firstElementChild.remove();
    
    setUpRadarChart();

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


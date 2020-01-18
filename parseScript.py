import json

with open('storyScript.txt', encoding='utf8') as f:
    lines = [line.rstrip('\n') for line in f]

structure = {}
stageCount = 0
idCount = 0

lineIterator = iter(lines)

for line in lineIterator:
    if line.find('Stage') == 0:
        stageCount += 1

        # Add a new stage
        structure['stage{}'.format(stageCount)] = []
        episodeCount = 0
        continue

    if line.find('Episode') == 0:
        episodeCount += 1
        idCount += 1
        currentStage = structure['stage{}'.format(stageCount)]

        currentStage.append({
            'id': idCount,
            'episode': episodeCount,
            'title': line[11:],
            'opening': '',
            'characters': None,
            'dialogue': [],
            'decision': '',
            'options': []
            })
        currentEpisode = currentStage[episodeCount-1]

        continue

    if line.find('Characters') == 0:
        keyValues = line[12:].split('. ')
        pairs = [pair.split(' - ') for pair in keyValues]
        currentEpisode['characters'] = {pair[0]: pair[1] for pair in pairs}
        continue

    if line.find('Opening') == 0:
        currentEpisode['opening'] = line[9:]    # 9 is the length of 'Opening'
        continue

    try:
        if line.split(': ')[0] in currentEpisode['characters'].keys():
            nameAndText = line.split(': ')
            name = currentEpisode['characters'][nameAndText[0]]
            text = nameAndText[1]

            currentEpisode['dialogue'].append({'name': name, 'text': text})
            continue
    except:
        pass


    if line.find('Decision') == 0:
        question = line[12:]
        currentEpisode['decision'] = question

    #     choices = []
    #     choices.append(next(lineIterator)) 
    #     choices.append(next(lineIterator))
    #     choices.append(next(lineIterator)) 
        
    #     next(lineIterator)  # Blank line
    #     next(lineIterator)  # Consequences word

    #     listABC = ['A', 'B', 'C']

    #     for i in range(3):
    #         rawOutcome = next(lineIterator)
    #         outcome, pointText = rawOutcome.split('. [')
    #         pointText = pointText[:-1]

    #         variableValue = pointText.split(', ')
    #         pairs = map(lambda x: x.split(': '), variableValue)
    #         point = {}
    #         for pair in pairs:
    #             if pair[1].find('rand') == -1:
    #                 point[pair[0]] = int(pair[1])
    #             else:
    #                 minMax = pair[1][5:]
    #                 minValue, maxValue = 
    #                 point[pair[0]]

    #         currentEpisode['options'].append({
    #             'option': listABC[i],
    #             'desc': choices[i],
    #             'outcome': outcome,
    #             'point': point,
    #         })

    #     continue

    if line.find('Option') == 0:
        description = next(lineIterator)[13:]
        outcome = next(lineIterator)[9:]
        
        point = {}
        for i in range(3):
            varName, valueChangeRaw = next(lineIterator).split(': ')
            valueChange = eval(valueChangeRaw[5:]) if valueChangeRaw.find('rand=')==0 else int(valueChangeRaw)
            
            point[varName] = valueChange

            print(line)

            currentEpisode['options'].append({
                'option': i+1,
                'desc': description,
                'outcome': outcome,
                'point': point,
            })
        
        continue
        


with open('storyScriptPython.json', 'w', encoding='utf-8') as f:
    json.dump(structure, f, ensure_ascii=False, indent=4)
import json

with open('storyScript.txt', encoding='utf8') as f:
    lines = [line.rstrip('\n') for line in f]

structure = {}
modCount = 0
idCount = 0

lineIterator = iter(lines)

for line in lineIterator:
    if line.find('Mod') == 0:
        modCount += 1
        structure['module{}'.format(modCount)] = []
        actCount = 0
        continue

    if line.find('Act') == 0:
        actCount += 1
        idCount += 1
        currentMod = structure['module{}'.format(modCount)]
        
        currentMod.append({'id': idCount,
                           'episode': actCount,
                           'title': '',
                           'opening': '',
                           'characters': None,
                           'dialogue': [],
                           'decision': '',
                           'options': []
                           })
        currentAct = currentMod[actCount-1]

        currentAct['title'] = line[7:]  # 7 is the length of 'Act x: '
        continue

    if line.find('Characters') == 0:
        keyValues = line[12:].split('. ')
        pairs = [pair.split(' - ') for pair in keyValues]
        currentAct['characters'] = {pair[0]: pair[1] for pair in pairs}
        continue

    if line.find('Opening') == 0:
        currentAct['opening'] = line[9:]    # 9 is the length of 'Opening'
        continue

    try:
        if line.split(': ')[0] in currentAct['characters'].keys():
            nameAndText = line.split(': ')
            name = currentAct['characters'][nameAndText[0]]
            text = nameAndText[1]

            currentAct['dialogue'].append({'name': name, 'text': text})
            continue
    except:
        pass

    if line.find('Decision') == 0:
        question = line[12:]
        currentAct['decision'] = question

        choices = []
        choices.append(next(lineIterator)) 
        choices.append(next(lineIterator))
        choices.append(next(lineIterator)) 
        
        next(lineIterator)  # Blank line
        next(lineIterator)  # Consequences word

        listABC = ['A', 'B', 'C']

        for i in range(3):
            rawOutcome = next(lineIterator)
            outcome = rawOutcome[:-5]
            point = rawOutcome[-3:-1]

            currentAct['options'].append({
                'option': listABC[i],
                'desc': choices[i],
                'outcome': outcome,
                'point': int(point),
            })

        continue



with open('storyScriptPython.json', 'w', encoding='utf-8') as f:
    json.dump(structure, f, ensure_ascii=False, indent=4)
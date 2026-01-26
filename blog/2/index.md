---
layout: default
title: 25 Jan 2026 - Blog
---

# An Ongoing Software -> Hardware Project
This is just some alpha testing for a project I am working on. Right now it is only a terminal-runnning python script I have collaboratively coded using Claude Sonnet 4.5. I am sure you get the point of what is going on here if you are looking at this.

## POEM

    user-home@user:~/Documents/poetrysynth$ python3 main.py
    Corpus loaded: 11545 words from glitch_poetry_corpus.txt
    Welcome to Glitch Poetry Synthesizer [Alpha]
    Loaded corpus: 11545 words

    Commands:
    gen              - Generate new clean base poem
    set <param> <n>  - Apply glitch parameter to current poem (1-10)
                        Parameters: select|filter1|filter2|emphasis1|emphasis2|mod|wavex|wavey|wavez
    reset            - Reset all parameters to 1 (clean)
    show             - Show current parameter values
    help             - Show this help
    quit             - Exit

    Parameter Scale:
    1 = Clean/Normal (no effects)
    2-10 = Escalating corruption intensity

    Workflow:
    1. Use 'gen' to create a new clean poem
    2. Use 'set <param> <value>' to apply glitch effects (1=clean, 10=extreme)
    3. Adjust multiple parameters to experiment with combinations
    4. Use 'reset' to return to clean version of same poem
    5. Use 'gen' again for a fresh poem when ready

    > gen
    NEW POEM GENERATED
    ========================================
    POEM
    diagram
    met eroded
    waters icanforget
    doyoualways evening-dress
    property
    GENERATED 25 JAN 2026 No. 1

    Meter: cinquain
    Base syllables: 22

    Parameters reset to clean (1). Use 'set <param> <value>' to apply glitch effects.

    > set WaveX 3
    wavex set to 3
    POEM
    d i a g r a m 
    m e t      e r o d e d 
    w a t e r s      i c a n f o r g e t 
    d o y o u a l w a y s      e v e n i n g - d r e s s 
    p r o p e r t y 
    GENERATED 25 JAN 2026 No. 1

    Current parameters: [1,1,1,1,1,1,3,1,1]
    Meter: cinquain
    Base syllables: 22

    Logged generation #1 to generation_log.json
    > set WaveX 4
    wavex set to 4
    POEM
    diagram
    met   eroded
    waters   icanforget
    doyoualways   evening-dress
    property
    GENERATED 25 JAN 2026 No. 1

    Current parameters: [1,1,1,1,1,1,4,1,1]
    Meter: cinquain
    Base syllables: 22

    Logged generation #1 to generation_log.json
    > Set WaveY 4
    wavey set to 4
    POEM
    diagram


    met   eroded


    waters   icanforget


    doyoualways   evening-dress


    property
    GENERATED 25 JAN 2026 No. 1

    Current parameters: [1,1,1,1,1,1,4,4,1]
    Meter: cinquain
    Base syllables: 22

    Logged generation #1 to generation_log.json
    > set WaveZ 8
    wavez set to 8
    POEM
    diagram


    met   eroded


        waters   icanforget


    doyoualways   evening-dress


                property
    GENERATED 25 JAN 2026 No. 1

    Current parameters: [1,1,1,1,1,1,4,4,8]
    Meter: cinquain
    Base syllables: 22

    Logged generation #1 to generation_log.json
    > set Filter2 2
    filter2 set to 2
    POEM
                diagram


            met   ▀roded


        w▌ters   icanfor#et


        ?o▀oua▐▀ays   evening-d▓ess


    property
    GENERATED 25 JAN 2026 No. 1

    Current parameters: [1,1,2,1,1,1,4,4,8]
    Meter: cinquain
    Base syllables: 22

    Logged generation #1 to generation_log.json
    > set Filter1 8
    filter1 set to 8
    POEM
            dia#r0x4Am


        m▄t   ero▌ed


            waters   ic▄?\x4*%░xDEADget


            do?x00oualways   e\xFFening-d\▐00es\x3F


    p▇op0xDEADrty
    GENERATED 25 JAN 2026 No. 1

    Current parameters: [1,8,2,1,1,1,4,4,8]
    Meter: cinquain
    Base syllables: 22

    Logged generation #1 to generation_log.json
    > set Filter1 1
    filter1 set to 1
    POEM
                diagr▀m


        ▄et   eroded


                waters   icanf▇rge▀


        doyoual?ays   evening-dress


                pro░erty
    GENERATED 25 JAN 2026 No. 1

    Current parameters: [1,1,2,1,1,1,4,4,8]
    Meter: cinquain
    Base syllables: 22

    Logged generation #1 to generation_log.json
    > set Emphasis1 8
    emphasis1 set to 8
    POEM
                diagra░   met   eroded   eroded   eroded   wate▒s   wate▒s   wate▒s   ica░fo▐get   doyoualways   evening-dr▆ss   pro▇e%ty
    GENERATED 25 JAN 2026 No. 1

    Current parameters: [1,1,2,8,1,1,4,4,8]
    Meter: cinquain
    Base syllables: 22

    Logged generation #1 to generation_log.json
    > set Emphasis1 1
    emphasis1 set to 1
    POEM
        diag▀am


        met   ero█ed


        *▌ters   ica█fo▒get


        d?youalways   evening-dress


                propert▐
    GENERATED 25 JAN 2026 No. 1

    Current parameters: [1,1,2,1,1,1,4,4,8]
    Meter: cinquain
    Base syllables: 22

    Logged generation #1 to generation_log.json
    > Set Mod 6
    mod set to 6
    POEM
        dia▄ram


        ▄▇█   ▒roded


    #aters   ▒can*o▐ge▒


        ▒░▌o▐%lwa▒s   e█enin#-dr▆ss


    prop%?ty
    GENERATED 25 JAN 2026 No. 1

    Current parameters: [1,1,2,1,1,6,4,4,8]
    Meter: cinquain
    Base syllables: 22

    Logged generation #1 to generation_log.json
    > dry Mod 1
    Unknown command. Type 'help' for commands.
    > set Mod 1
    mod set to 1
    POEM
    diagram


    met   eroded


        waters   ▄can%orget


        doyoualways   evening-dres▐


    p▓oper#y
    GENERATED 25 JAN 2026 No. 1

    Current parameters: [1,1,2,1,1,1,4,4,8]
    Meter: cinquain
    Base syllables: 22

    Logged generation #1 to generation_log.json
    > set Emphasis2 4
    emphasis2 set to 4
    POEM
            ḑ▆a▓ř̛̘ȧ̛m̻̿̀


                m̶̾̅̆e̛t̃   e?od̺̜̻̾ê̢̘̜*


                w▄t̿▓r̸̥̀̀s̺̋   ic̣̙̼̽an̐̑̑forg̺e̢̦̊̅t̗̅


        dȯ̧̑̽ȳ̝̼̌ọ̶̻▀a̻̽▌w̎ǎ̶y̐s̟   e̻̼v̦̻̅̄e̺̿nị̼̻́ng-ḑ̖̏▓ê̖̹̑s̀s̹̃


    pr̈̇ō̻̻p̶̞̻̆ert̸y̜̟̎̐
    GENERATED 25 JAN 2026 No. 1

    Current parameters: [1,1,2,1,4,1,4,4,8]
    Meter: cinquain
    Base syllables: 22

    Logged generation #1 to generation_log.json
    > set Emphasis2 2
    emphasis2 set to 2
    POEM
            di̿̌a̞gr̹█ṃ


    ▐e̶̾t   é̥r̿od̶̙e̾̆d


    ▇àt̆er̤s̥̊   i▇a̽ṅf̊̅o̹rgê̗t


    d̻o̡y̏ò̌u̹a̽lẇ̖ay̿̆s̼̃   ĕ̚ve̷̽n̼ińg̍-d̠r̷̉e̥s̟ŝ


            p̽ro̹per̽ty
    GENERATED 25 JAN 2026 No. 1

    Current parameters: [1,1,2,1,2,1,4,4,8]
    Meter: cinquain
    Base syllables: 22

    Logged generation #1 to generation_log.json
    > set Emphasis2 1    
    emphasis2 set to 1
    POEM
                #iagram


        m▓t   er▐ded


        wa%ers   ica░for?et


    doyoualways   ev▄ning-dre▐s


    property
    GENERATED 25 JAN 2026 No. 1

    Current parameters: [1,1,2,1,1,1,4,4,8]
    Meter: cinquain
    Base syllables: 22

    Logged generation #1 to generation_log.json
    > reset     
    All parameters reset to 1 (clean)
    POEM
    diagram
    met eroded
    waters icanforget
    doyoualways evening-dress
    property
    GENERATED 25 JAN 2026 No. 1

    Current parameters: [1,1,1,1,1,1,1,1,1]
    Meter: cinquain
    Base syllables: 22

    Logged generation #1 to generation_log.json
    >
/**
 * The Liar's Game - Level 1: "The Night Nanny"
 *
 * DATA-DRIVEN STORY FILE
 * ----------------------
 * To add Level 2: add a new entry in LEVELS (e.g. LEVELS.level2 = {...})
 * following the same schema. The engine (game.js) reads this data.
 *
 * Scene types: title | dialogue | narration | rules_card | decision | failure_sequence | ending | game_over | win
 * Line types: "speech" (bubble) | "narration" (caption box)
 * Choice: { text, correct: bool, failTag?: string }
 */

const LEVELS = {
  level1: {
    id: "level1",
    title: "The Liar's Game",
    subtitle: "Level 1: The Night Nanny",
    startScene: "title_screen",
    scenes: {
      /* ===================== TITLE ===================== */
      title_screen: {
        type: "title",
        image: "assets/images/title.webp",
        heading: "THE LIAR'S GAME",
        subheading: "Level 1: The Night Nanny",
        prompt: "Tap to begin",
        next: "act1_phone"
      },

      /* ===================== ACT 1 ===================== */
      act1_phone: {
        type: "dialogue",
        lines: [
          { type: "narration", text: "Lagos. A hot evening. Your phone won't stop ringing.", image: "assets/images/phone_call.webp", sfx: "phone_ring" },
          { type: "speech", speaker: "Chika", side: "left", text: "Hello? Are you sitting down? I found you a job.", image: "assets/images/chika_call.webp" },
          { type: "speech", speaker: "You", side: "right", text: "Chika, if this is another one of your 'opportunities'...", image: "assets/images/phone_call.webp", pov: true },
          { type: "speech", speaker: "Chika", side: "left", text: "Five hundred thousand naira. One night. Babysitting.", image: "assets/images/chika_call.webp" },
          { type: "speech", speaker: "You", side: "right", text: "Five hundred— for babysitting? What's the catch?", image: "assets/images/phone_call.webp", pov: true },
          { type: "speech", speaker: "Chika", side: "left", text: "The catch? You have to lie. A lot. The family is... strange. People will test you.", image: "assets/images/chika_worried.webp" },
          { type: "speech", speaker: "You", side: "right", text: "Lie? To who?", image: "assets/images/phone_call.webp", pov: true },
          { type: "speech", speaker: "Chika", side: "left", text: "Anyone who comes asking questions. If they smell fear, you're done. Just keep your story straight.", image: "assets/images/chika_worried.webp", sfx: "call_end" }
        ],
        next: "act1_gate"
      },

      act1_gate: {
        type: "dialogue",
        lines: [
          { type: "narration", text: "Wellington Estate, Lagos. 6:45 p.m.", image: "assets/images/mansion_gate.webp" },
          { type: "speech", speaker: "Guard", side: "left", text: "Evening. Who you dey find?", image: "assets/images/guard_closeup.webp" },
          { type: "speech", speaker: "You", side: "right", text: "I'm here for the babysitting job. Mrs. Okonkwo.", image: "assets/images/mansion_gate.webp", pov: true },
          { type: "speech", speaker: "Guard", side: "left", text: "You're the new one? ...Okay.", image: "assets/images/guard_closeup.webp" },
          { type: "speech", speaker: "Guard", side: "left", text: "Small advice. Whatever they ask you tonight... make sure your answer sounds true.", image: "assets/images/guard_suspicious.webp", sfx: "door_knock" },
          { type: "narration", text: "He opens the gate slowly. Like he's testing you already.", image: "assets/images/mansion_gate.webp" }
        ],
        next: "act1_mrs_o"
      },

      act1_mrs_o: {
        type: "dialogue",
        lines: [
          { type: "narration", text: "Inside the mansion. Everything is too quiet. Too clean.", image: "assets/images/mansion_interior.webp" },
          { type: "speech", speaker: "Mrs. Okonkwo", side: "left", text: "Ah. You came. Thank you. I was beginning to worry.", image: "assets/images/mrs_okonkwo_calm.webp" },
          { type: "speech", speaker: "You", side: "right", text: "Good evening, ma. Chika said you needed help tonight.", image: "assets/images/mansion_interior.webp", pov: true },
          { type: "speech", speaker: "Mrs. Okonkwo", side: "left", text: "Yes. Just one night. My baby, Ada, is sleeping upstairs. I will leave at 8 p.m. and return at 6 a.m.", image: "assets/images/mrs_okonkwo_calm.webp" },
          { type: "speech", speaker: "You", side: "right", text: "That's all?", image: "assets/images/mansion_interior.webp", pov: true },
          { type: "speech", speaker: "Mrs. Okonkwo", side: "left", text: "Not quite. Tonight, people may come. They may call. They may try to trick you. Your job is simple: lie well.", image: "assets/images/mrs_okonkwo_serious.webp" },
          { type: "speech", speaker: "You", side: "right", text: "Lie... well?", image: "assets/images/mansion_interior.webp", pov: true },
          { type: "speech", speaker: "Mrs. Okonkwo", side: "left", text: "If your story cracks, you lose. If you panic, you lose. Remember my rules — and remember your cover story.", image: "assets/images/mrs_okonkwo_serious.webp" }
        ],
        next: "act1_rules_dialogue"
      },

      act1_rules_dialogue: {
        type: "dialogue",
        lines: [
          { type: "speech", speaker: "Mrs. Okonkwo", side: "left", text: "Rule one. Your cover story: if anyone asks, I am upstairs resting. Never admit you are alone. Never.", image: "assets/images/mrs_okonkwo_rule1.webp" },
          { type: "speech", speaker: "Mrs. Okonkwo", side: "left", text: "Rule two. Never open the gate after 10 p.m. No matter who knocks. A good liar doesn't open doors.", image: "assets/images/mrs_okonkwo_rule2.webp" },
          { type: "speech", speaker: "Mrs. Okonkwo", side: "left", text: "Rule three. If the baby asks for food, give only water. Don't over-explain. Short lies are safer.", image: "assets/images/mrs_okonkwo_rule3.webp" },
          { type: "speech", speaker: "Mrs. Okonkwo", side: "left", text: "Rule four. If I call, I always start with 'Good night, Ada.' If a call starts any other way, it's a trap. Don't answer.", image: "assets/images/mrs_okonkwo_rule4.webp" },
          { type: "speech", speaker: "Mrs. Okonkwo", side: "left", text: "Rule five. If the lights go out, go to the sitting room and stay quiet until I return. Silence is also a kind of lie.", image: "assets/images/mrs_okonkwo_rule5.webp" },
          { type: "narration", text: "She smiles. But her eyes don't.", image: "assets/images/mrs_okonkwo_rule5.webp" }
        ],
        next: "act1_rules_card"
      },

      act1_rules_card: {
        type: "rules_card",
        image: "assets/images/rules_moment.webp",
        durationMs: 8000,
        heading: "REMEMBER THE RULES",
        rules: [
          "Cover story: if anyone asks, \"Madam is upstairs resting.\" Never admit you're alone.",
          "Never open the gate after 10 p.m., no matter who knocks.",
          "If the baby asks for food, give only water. Don't over-explain.",
          "If I call, I always start with \"Good night, Ada.\" Any other opening = trap. Don't answer.",
          "If the lights go out, go to the sitting room and stay quiet until I'm back."
        ],
        next: "act1_departure"
      },

      act1_departure: {
        type: "dialogue",
        lines: [
          { type: "speech", speaker: "Mrs. Okonkwo", side: "left", text: "Good. I am leaving now. Keep your story straight.", image: "assets/images/mrs_okonkwo_leaving.webp" },
          { type: "speech", speaker: "You", side: "right", text: "Yes, ma. I won't slip.", image: "assets/images/mansion_interior.webp", pov: true },
          { type: "narration", text: "The car engine fades into the Lagos night.", image: "assets/images/car_leaving.webp", sfx: "car_drive" },
          { type: "narration", text: "You are alone in the house. With a baby. A cover story. And seven hours of lies ahead.", image: "assets/images/mansion_night.webp" },
          { type: "narration", text: "7 HOURS TO SURVIVE.", image: "assets/images/title_night.webp", sfx: "heartbeat" }
        ],
        next: "act2_d1_setup"
      },

      /* ===================== ACT 2 ===================== */
      act2_d1_setup: {
        type: "dialogue",
        lines: [
          { type: "narration", text: "10:15 p.m. The house is silent. Too silent.", image: "assets/images/mansion_night.webp" },
          { type: "narration", text: "KNOCK. KNOCK. KNOCK.", image: "assets/images/gate_night.webp", sfx: "door_knock" },
          { type: "speech", speaker: "Man at Gate", side: "left", text: "Hello? Open the gate! I'm Mrs. Okonkwo's brother. She sent me to pick up her bag.", image: "assets/images/gate_man.webp" },
          { type: "speech", speaker: "Man at Gate", side: "left", text: "Abeg, I dey rush. Just open am.", image: "assets/images/gate_man.webp" }
        ],
        next: "act2_d1"
      },

      act2_d1: {
        type: "decision",
        id: "d1",
        prompt: "He's pushing you. What's your smoothest lie?",
        image: "assets/images/gate_man.webp",
        timerSeconds: 5,
        choices: [
          { text: "\"Madam is resting upstairs. She left no instructions. Come back in the morning.\"", correct: true },
          { text: "\"I'm alone here, I can't open the gate for anybody!\"", correct: false, failTag: "alone" },
          { text: "Open the gate — it's easier than arguing.", correct: false, failTag: "gate" }
        ],
        nextCorrect: "act2_d1_correct",
        nextWrong: "act2_d1_wrong"
      },

      act2_d1_correct: {
        type: "dialogue",
        lines: [
          { type: "speech", speaker: "You", side: "right", text: "Madam is resting upstairs. She left no instructions. Please come back in the morning.", image: "assets/images/gate_night.webp", pov: true },
          { type: "speech", speaker: "Man at Gate", side: "left", text: "...Tch. You sure she's upstairs?", image: "assets/images/gate_man.webp" },
          { type: "speech", speaker: "You", side: "right", text: "I'm sure. Good night, sir.", image: "assets/images/gate_night.webp", pov: true },
          { type: "narration", text: "Footsteps fade. Your lie held. Barely.", image: "assets/images/mansion_night.webp" }
        ],
        next: "act2_d2_setup"
      },

      act2_d1_wrong: {
        type: "failure_sequence",
        failTag: "gate",
        failTagScenes: {
          gate: [
            { type: "narration", text: "The gate creaks open. Your easy way out becomes his easy way in.", image: "assets/images/fail_gate_open.webp", sfx: "door_knock" },
            { type: "speech", speaker: "Man at Gate", side: "left", text: "Thank you. You're very... trusting.", image: "assets/images/fail_gate_man_smile.webp" },
            { type: "narration", text: "Two more shadows slip in behind him. Your story is over.", image: "assets/images/fail_shadows.webp", sfx: "heartbeat" }
          ],
          alone: [
            { type: "narration", text: "\"I'm alone here!\" The words echo into the night. Worst lie ever — because it's the truth.", image: "assets/images/gate_man.webp", sfx: "heartbeat" },
            { type: "speech", speaker: "Man at Gate", side: "left", text: "Alone? That's... very useful to know.", image: "assets/images/fail_gate_man_smile.webp" },
            { type: "narration", text: "He smiles and pulls out his phone. You just handed him the whole game.", image: "assets/images/fail_shadows.webp" }
          ],
          timeout: [
            { type: "narration", text: "You freeze. Five seconds of silence. In this game, silence is a confession.", image: "assets/images/gate_man.webp", sfx: "heartbeat" },
            { type: "speech", speaker: "Man at Gate", side: "left", text: "Nobody confident enough to answer? Interesting.", image: "assets/images/fail_gate_man_smile.webp" },
            { type: "narration", text: "He steps back, makes a call. Your hesitation just wrote the ending.", image: "assets/images/fail_shadows.webp" }
          ]
        },
        next: "game_over"
      },

      act2_d2_setup: {
        type: "dialogue",
        lines: [
          { type: "narration", text: "11:00 p.m. You settle into the couch. Maybe your lie was good enough.", image: "assets/images/sitting_room_calm.webp" },
          { type: "narration", text: "A small cry from upstairs. Then a voice. Soft. Too clear.", image: "assets/images/baby_room.webp", sfx: "baby_cry" },
          { type: "speech", speaker: "Baby Ada", side: "left", text: "I'm hungry... where's mummy?", image: "assets/images/baby_calm.webp" }
        ],
        next: "act2_d2"
      },

      act2_d2: {
        type: "decision",
        id: "d2",
        prompt: "The baby is testing you. What do you say and do?",
        image: "assets/images/baby_calm.webp",
        timerSeconds: 5,
        choices: [
          { text: "\"Mummy is upstairs resting. Here's some water.\"", correct: true },
          { text: "\"She's not here. It's just me tonight. Want food?\"", correct: false, failTag: "expose" },
          { text: "Give him milk and biscuits to keep him quiet.", correct: false, failTag: "food" }
        ],
        nextCorrect: "act2_d2_correct",
        nextWrong: "act2_d2_wrong"
      },

      act2_d2_correct: {
        type: "dialogue",
        lines: [
          { type: "speech", speaker: "You", side: "right", text: "Mummy is upstairs resting. Here's some water, okay?", image: "assets/images/baby_room.webp", pov: true },
          { type: "narration", text: "The baby drinks quietly. Those calm eyes study you like a lie detector.", image: "assets/images/baby_calm.webp" },
          { type: "narration", text: "He smiles. You kept the story straight.", image: "assets/images/baby_calm.webp" }
        ],
        next: "act2_d3_setup"
      },

      act2_d2_wrong: {
        type: "failure_sequence",
        failTag: "food",
        failTagScenes: {
          food: [
            { type: "narration", text: "You hand over milk and biscuits. The baby eats. Too eagerly.", image: "assets/images/fail_baby_dark.webp", sfx: "baby_cry" },
            { type: "narration", text: "The room goes cold. You broke a rule — and bad liars always break rules first.", image: "assets/images/fail_baby_dark.webp", sfx: "heartbeat" },
            { type: "narration", text: "The door shuts behind you. The house knows you slipped.", image: "assets/images/fail_dark_hallway.webp" }
          ],
          expose: [
            { type: "narration", text: "You told the truth. To a baby. In a liar's game.", image: "assets/images/baby_room.webp", sfx: "heartbeat" },
            { type: "narration", text: "The baby's calm eyes go dark. Like you just failed an exam no one told you about.", image: "assets/images/fail_baby_dark.webp" },
            { type: "narration", text: "The hallway stretches. The house doesn't forgive honesty.", image: "assets/images/fail_dark_hallway.webp" }
          ],
          timeout: [
            { type: "narration", text: "You hesitate. The baby tilts his head. Even he can smell a bad liar.", image: "assets/images/baby_calm.webp", sfx: "heartbeat" },
            { type: "narration", text: "His whisper becomes a cry. The sound fills the house.", image: "assets/images/fail_baby_dark.webp", sfx: "baby_cry" },
            { type: "narration", text: "You lost control of the story. And in this house, that's everything.", image: "assets/images/fail_dark_hallway.webp" }
          ]
        },
        next: "game_over"
      },

      act2_d3_setup: {
        type: "dialogue",
        lines: [
          { type: "narration", text: "11:50 p.m. Your phone buzzes on the table.", image: "assets/images/phone_ringing.webp", sfx: "phone_ring" },
          { type: "narration", text: "Unknown number. The screen glows in the dark room.", image: "assets/images/phone_ringing.webp" },
          { type: "speech", speaker: "Voice on Phone", side: "left", text: "Hello, Ada's nanny, are you alone?", image: "assets/images/phone_ringing.webp" }
        ],
        next: "act2_d3"
      },

      act2_d3: {
        type: "decision",
        id: "d3",
        prompt: "No code words. It's a trap. What's the smart liar move?",
        image: "assets/images/phone_ringing.webp",
        timerSeconds: 5,
        choices: [
          { text: "Don't answer. Let the lie be silence.", correct: true },
          { text: "Answer: \"No, madam is upstairs resting.\"", correct: false, failTag: "answer" },
          { text: "Answer: \"Yes, I'm alone — who is this?\"", correct: false, failTag: "alone" }
        ],
        nextCorrect: "act2_d3_correct",
        nextWrong: "act2_d3_wrong"
      },

      act2_d3_correct: {
        type: "dialogue",
        lines: [
          { type: "narration", text: "You don't touch the phone. It rings... and rings... and stops.", image: "assets/images/phone_ringing.webp" },
          { type: "narration", text: "No code. No answer. A good liar knows when not to speak.", image: "assets/images/sitting_room_calm.webp" }
        ],
        next: "act2_d4_setup"
      },

      act2_d3_wrong: {
        type: "failure_sequence",
        failTag: "answer",
        failTagScenes: {
          answer: [
            { type: "narration", text: "You answer with a smooth lie. But you walked into the trap by picking up.", image: "assets/images/phone_ringing.webp", sfx: "heartbeat" },
            { type: "speech", speaker: "Voice on Phone", side: "left", text: "Good. Now I know you're there... and you're nervous.", image: "assets/images/fail_phone_dark.webp" },
            { type: "narration", text: "The line goes dead. The front door handle turns.", image: "assets/images/fail_door_handle.webp", sfx: "door_knock" }
          ],
          alone: [
            { type: "narration", text: "You blurt out the truth. The worst move in a liar's house.", image: "assets/images/phone_ringing.webp", sfx: "heartbeat" },
            { type: "speech", speaker: "Voice on Phone", side: "left", text: "Thank you. That's all I needed.", image: "assets/images/fail_phone_dark.webp" },
            { type: "narration", text: "The call ends. Outside, a car door slams. Your truth just became their weapon.", image: "assets/images/fail_shadows.webp" }
          ],
          timeout: [
            { type: "narration", text: "You stare at the ringing phone too long. Indecision is loud.", image: "assets/images/phone_ringing.webp", sfx: "heartbeat" },
            { type: "narration", text: "A text appears: \"I can hear you breathing.\"", image: "assets/images/fail_phone_dark.webp" },
            { type: "narration", text: "You lost the moment. The trap already sprung.", image: "assets/images/fail_dark_hallway.webp" }
          ]
        },
        next: "game_over"
      },

      act2_d4_setup: {
        type: "dialogue",
        lines: [
          { type: "narration", text: "12:30 a.m. The hum of the fridge is the only sound.", image: "assets/images/sitting_room_calm.webp" },
          { type: "narration", text: "Then—", image: "assets/images/sitting_room_calm.webp" },
          { type: "narration", text: "Everything goes black.", image: "assets/images/dark_house.webp", sfx: "lights_out" },
          { type: "narration", text: "A crash from the kitchen. Something fell. Or someone wants you to look.", image: "assets/images/dark_house.webp", sfx: "heartbeat" }
        ],
        next: "act2_d4"
      },

      act2_d4: {
        type: "decision",
        id: "d4",
        prompt: "Lights out. Noise in the kitchen. How do you play it?",
        image: "assets/images/dark_house.webp",
        timerSeconds: 5,
        choices: [
          { text: "Slip into the sitting room and stay dead quiet.", correct: true },
          { text: "Shout: \"Who's there? I've called the police!\"", correct: false, failTag: "shout" },
          { text: "Creep to the kitchen to see who's there.", correct: false, failTag: "kitchen" }
        ],
        nextCorrect: "act2_d4_correct",
        nextWrong: "act2_d4_wrong"
      },

      act2_d4_correct: {
        type: "dialogue",
        lines: [
          { type: "narration", text: "You move silently into the sitting room. No footsteps. No breath. No story to crack.", image: "assets/images/dark_house.webp" },
          { type: "narration", text: "Minutes crawl by. Then the lights flicker back on. The kitchen is empty.", image: "assets/images/sitting_room_calm.webp" },
          { type: "speech", speaker: "You", side: "right", text: "Let them wonder where I am.", image: "assets/images/sitting_room_calm.webp", pov: true }
        ],
        next: "act2_d5_setup"
      },

      act2_d4_wrong: {
        type: "failure_sequence",
        failTag: "kitchen",
        failTagScenes: {
          kitchen: [
            { type: "narration", text: "You creep toward the kitchen. Your phone torch shakes in your hand.", image: "assets/images/fail_kitchen_dark.webp", sfx: "heartbeat" },
            { type: "narration", text: "A chair is overturned. The back door is open. Wind moves the curtain.", image: "assets/images/fail_kitchen_dark.webp" },
            { type: "narration", text: "The curtain falls. Someone was waiting for you to look.", image: "assets/images/fail_kitchen_figure.webp", sfx: "heartbeat" }
          ],
          shout: [
            { type: "narration", text: "You shout a bold lie into the dark. Loud. Confident. Stupid.", image: "assets/images/dark_house.webp", sfx: "heartbeat" },
            { type: "narration", text: "The silence that follows is worse. Now they know exactly where you are.", image: "assets/images/fail_dark_hallway.webp" },
            { type: "narration", text: "Footsteps move toward your voice. A bad lie is a beacon.", image: "assets/images/fail_kitchen_figure.webp" }
          ],
          timeout: [
            { type: "narration", text: "You freeze in the dark. Five seconds. Your fear makes noise even when you don't.", image: "assets/images/dark_house.webp", sfx: "heartbeat" },
            { type: "narration", text: "Something brushes past your shoulder in the black.", image: "assets/images/fail_dark_hallway.webp" },
            { type: "narration", text: "You didn't move. You didn't lie. You just... lost.", image: "assets/images/fail_kitchen_figure.webp" }
          ]
        },
        next: "game_over"
      },

      act2_d5_setup: {
        type: "dialogue",
        lines: [
          { type: "narration", text: "1:45 a.m. You're half-asleep on the couch when a shadow appears at the window.", image: "assets/images/neighbour_window.webp" },
          { type: "narration", text: "Tap. Tap. Tap.", image: "assets/images/neighbour_window.webp", sfx: "door_knock" },
          { type: "speech", speaker: "Neighbour", side: "left", text: "Psst! Sorry o. I saw the lights go off. Everything okay?", image: "assets/images/neighbour_window.webp" },
          { type: "speech", speaker: "Neighbour", side: "left", text: "You dey alone for there?", image: "assets/images/neighbour_close.webp" }
        ],
        next: "act2_d5"
      },

      act2_d5: {
        type: "decision",
        id: "d5",
        prompt: "He asked the dangerous question. Sell the lie.",
        image: "assets/images/neighbour_close.webp",
        timerSeconds: 5,
        choices: [
          { text: "\"No sir, the family is upstairs resting. Everything is fine.\"", correct: true },
          { text: "\"Eh... yes... I mean no... I mean somebody is around...\"", correct: false, failTag: "badlie" },
          { text: "\"Yes, I'm alone. Please don't tell anybody.\"", correct: false, failTag: "alone" }
        ],
        nextCorrect: "act2_d5_correct",
        nextWrong: "act2_d5_wrong"
      },

      act2_d5_correct: {
        type: "dialogue",
        lines: [
          { type: "speech", speaker: "You", side: "right", text: "No sir, the family is upstairs resting. Everything is fine, thank you.", image: "assets/images/neighbour_window.webp", pov: true },
          { type: "speech", speaker: "Neighbour", side: "left", text: "Ah, okay o. Just checking. Good night.", image: "assets/images/neighbour_window.webp" },
          { type: "narration", text: "He walks away. Smooth lie. No cracks. You're getting good at this.", image: "assets/images/sitting_room_calm.webp" }
        ],
        next: "act2_d6_setup"
      },

      act2_d5_wrong: {
        type: "failure_sequence",
        failTag: "alone",
        failTagScenes: {
          alone: [
            { type: "narration", text: "You told the truth again. In a liar's game. Why?", image: "assets/images/neighbour_close.webp", sfx: "heartbeat" },
            { type: "speech", speaker: "Neighbour", side: "left", text: "Alone... interesting. Very interesting.", image: "assets/images/fail_neighbour_sinister.webp" },
            { type: "narration", text: "He smiles and walks away. Five minutes later, whispers surround the house.", image: "assets/images/fail_shadows.webp" }
          ],
          badlie: [
            { type: "narration", text: "That wasn't a lie. That was a car crash of words.", image: "assets/images/neighbour_close.webp", sfx: "heartbeat" },
            { type: "speech", speaker: "Neighbour", side: "left", text: "You sound nervous... anybody would think you're alone.", image: "assets/images/fail_neighbour_sinister.webp" },
            { type: "narration", text: "He pulls out his phone as he walks away. Your bad lie did all the talking.", image: "assets/images/fail_shadows.webp" }
          ],
          timeout: [
            { type: "narration", text: "You freeze. Five seconds. A liar who can't speak is just a caught person.", image: "assets/images/neighbour_close.webp", sfx: "heartbeat" },
            { type: "speech", speaker: "Neighbour", side: "left", text: "No answer... I'll take that as a yes.", image: "assets/images/fail_neighbour_sinister.webp" },
            { type: "narration", text: "He disappears into the dark. Your silence told the whole truth.", image: "assets/images/fail_shadows.webp" }
          ]
        },
        next: "game_over"
      },

      act2_d6_setup: {
        type: "dialogue",
        lines: [
          { type: "narration", text: "3:00 a.m. The darkest hour. Even Lagos is holding its breath.", image: "assets/images/mansion_night.webp" },
          { type: "narration", text: "Your phone rings again.", image: "assets/images/phone_ringing.webp", sfx: "phone_ring" },
          { type: "narration", text: "Unknown number. Your finger hovers. Every instinct says trap.", image: "assets/images/phone_ringing.webp" },
          { type: "speech", speaker: "Voice on Phone", side: "left", text: "Good night, Ada...", image: "assets/images/phone_ringing.webp" }
        ],
        next: "act2_d6"
      },

      act2_d6: {
        type: "decision",
        id: "d6",
        prompt: "The code words. Is this the one truth in a night of lies?",
        image: "assets/images/phone_ringing.webp",
        timerSeconds: 5,
        choices: [
          { text: "Answer it. That's the code.", correct: true },
          { text: "Ignore it — could be a trick.", correct: false, failTag: "ignore" },
          { text: "Pick up and bluff: \"Who's this? Madam is busy!\"", correct: false, failTag: "bluff" }
        ],
        nextCorrect: "act2_d6_correct",
        nextWrong: "act2_d6_wrong"
      },

      act2_d6_correct: {
        type: "dialogue",
        lines: [
          { type: "speech", speaker: "You", side: "right", text: "Hello? Mrs. Okonkwo?", image: "assets/images/phone_ringing.webp", pov: true },
          { type: "speech", speaker: "Mrs. Okonkwo (phone)", side: "left", text: "Good night, Ada. You remembered. I'm close. Keep your story straight a little longer.", image: "assets/images/phone_ringing.webp" },
          { type: "narration", text: "The line clicks off. In a night full of lies, the code was the one truth.", image: "assets/images/sitting_room_calm.webp" }
        ],
        next: "act2_d7_setup"
      },

      act2_d6_wrong: {
        type: "failure_sequence",
        failTag: "ignore",
        failTagScenes: {
          ignore: [
            { type: "narration", text: "You let it ring out. The real code dies in your voicemail.", image: "assets/images/phone_ringing.webp", sfx: "heartbeat" },
            { type: "narration", text: "A text buzzes in: \"You didn't trust the right voice. I can't help you now.\"", image: "assets/images/fail_phone_dark.webp" },
            { type: "narration", text: "You were so busy lying, you missed the truth.", image: "assets/images/fail_dark_hallway.webp" }
          ],
          bluff: [
            { type: "narration", text: "You bluff into the phone. Wrong move. It was her.", image: "assets/images/phone_ringing.webp", sfx: "heartbeat" },
            { type: "speech", speaker: "Mrs. Okonkwo (phone)", side: "left", text: "...I gave you the code for a reason.", image: "assets/images/fail_phone_dark.webp" },
            { type: "narration", text: "The line goes dead. Even good liars need to know when to stop performing.", image: "assets/images/fail_dark_hallway.webp" }
          ],
          timeout: [
            { type: "narration", text: "You hesitate. The code words hang in the air. Your thumb won't move.", image: "assets/images/phone_ringing.webp", sfx: "heartbeat" },
            { type: "narration", text: "The call ends. The one person on your side just slipped away.", image: "assets/images/fail_phone_dark.webp" },
            { type: "narration", text: "In the liar's game, timing is everything. You ran out.", image: "assets/images/fail_dark_hallway.webp" }
          ]
        },
        next: "game_over"
      },

      act2_d7_setup: {
        type: "dialogue",
        lines: [
          { type: "narration", text: "5:55 a.m. Pale morning light creeps through the curtains.", image: "assets/images/morning_light.webp" },
          { type: "narration", text: "The front door opens. Heels on marble. Calm, measured steps.", image: "assets/images/morning_light.webp", sfx: "door_knock" },
          { type: "speech", speaker: "Mrs. Okonkwo", side: "left", text: "Good morning. You're still here. Good.", image: "assets/images/mrs_okonkwo_morning.webp" },
          { type: "speech", speaker: "Mrs. Okonkwo", side: "left", text: "One last question. Did you open the gate for anyone?", image: "assets/images/mrs_okonkwo_morning.webp" }
        ],
        next: "act2_d7"
      },

      act2_d7: {
        type: "decision",
        id: "d7",
        prompt: "Final test. Keep it clean. Keep it believable.",
        image: "assets/images/mrs_okonkwo_morning.webp",
        timerSeconds: 5,
        choices: [
          { text: "\"No, madam.\"", correct: true },
          { text: "\"No! I mean, someone came but I didn't open it and I told them you were upstairs and—\"", correct: false, failTag: "overexplain" },
          { text: "Say nothing. Just stare.", correct: false, failTag: "silent" }
        ],
        nextCorrect: "ending_win",
        nextWrong: "act2_d7_wrong"
      },

      act2_d7_wrong: {
        type: "failure_sequence",
        failTag: "overexplain",
        failTagScenes: {
          overexplain: [
            { type: "narration", text: "You talk too much. Every extra word is a crack in the mask.", image: "assets/images/mrs_okonkwo_morning.webp", sfx: "heartbeat" },
            { type: "speech", speaker: "Mrs. Okonkwo", side: "left", text: "A simple question. A complicated answer. That's what bad liars do.", image: "assets/images/mrs_okonkwo_serious.webp" },
            { type: "narration", text: "Her smile fades. You survived the night, but your mouth lost the game.", image: "assets/images/fail_mrs_okonkwo_dark.webp" }
          ],
          silent: [
            { type: "narration", text: "You freeze. No lie. No truth. Just fear.", image: "assets/images/mrs_okonkwo_morning.webp", sfx: "heartbeat" },
            { type: "speech", speaker: "Mrs. Okonkwo", side: "left", text: "Silence can be smart. But this silence? This is guilt.", image: "assets/images/mrs_okonkwo_serious.webp" },
            { type: "narration", text: "She turns away. The final lie you needed never came out.", image: "assets/images/fail_mrs_okonkwo_dark.webp" }
          ],
          timeout: [
            { type: "narration", text: "Five seconds. The easiest question of the night, and you choke.", image: "assets/images/mrs_okonkwo_morning.webp", sfx: "heartbeat" },
            { type: "speech", speaker: "Mrs. Okonkwo", side: "left", text: "Disappointing. You were so close.", image: "assets/images/mrs_okonkwo_serious.webp" },
            { type: "narration", text: "At the finish line, the liar forgot how to speak.", image: "assets/images/fail_mrs_okonkwo_dark.webp" }
          ]
        },
        next: "game_over"
      },

      /* ===================== ENDING ===================== */
      ending_win: {
        type: "ending",
        lines: [
          { type: "speech", speaker: "You", side: "right", text: "No, madam.", image: "assets/images/mrs_okonkwo_morning.webp", pov: true },
          { type: "speech", speaker: "Mrs. Okonkwo", side: "left", text: "Good. Clean. No extra words. You're a natural.", image: "assets/images/mrs_okonkwo_calm.webp" },
          { type: "narration", text: "She hands you an envelope. Thick. Heavy. Real.", image: "assets/images/payment_envelope.webp" },
          { type: "speech", speaker: "Mrs. Okonkwo", side: "left", text: "Five hundred thousand naira. You lied beautifully.", image: "assets/images/payment_envelope.webp" },
          { type: "speech", speaker: "You", side: "right", text: "I just... kept my story straight.", image: "assets/images/baby_calm.webp", pov: true },
          { type: "speech", speaker: "Mrs. Okonkwo", side: "left", text: "That's what all the best liars say.", image: "assets/images/mrs_okonkwo_calm.webp" },
          { type: "narration", text: "As you walk to the gate, you glance back. Baby Ada is at the upstairs window.", image: "assets/images/baby_window.webp" },
          { type: "narration", text: "He waves slowly. Then mouths two words you somehow read from here:", image: "assets/images/baby_window.webp" },
          { type: "narration", text: "\"LEVEL TWO.\"", image: "assets/images/baby_window.webp", sfx: "heartbeat" },
          { type: "narration", text: "Your phone buzzes. Unknown number: \"Nice lies. Ready for a bigger one?\"", image: "assets/images/phone_ringing.webp" }
        ],
        next: "win_screen"
      },

      win_screen: {
        type: "win",
        image: "assets/images/baby_window.webp"
      },

      /* ===================== GAME OVER ===================== */
      game_over: {
        type: "game_over",
        image: "assets/images/fail_dark_hallway.webp",
        message: "You lost the Liar's Game. You're not good enough to be a liar."
      }
    }
  }
};

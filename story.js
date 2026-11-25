/**
 * The Liar's Game - Level 1: "The Night Nanny"
 * 
 * DATA-DRIVEN STORY FILE
 * ----------------------
 * To add Level 2: add a new entry in LEVELS (e.g. LEVELS.level2 = {...})
 * and add a Level 2 object following the same schema. The engine (game.js)
 * reads this data; no engine changes should be needed for new story content.
 *
 * Scene types:
 *  - title: title/start screen
 *  - dialogue: movie-style conversation, lines alternate speakers/images
 *  - narration: full-screen image with caption box
 *  - rules_card: timed full-screen rules reveal
 *  - decision: timed choice with shuffled buttons
 *  - failure_sequence: scripted post-failure tension scenes, then game over
 *  - ending: win ending
 *
 * Line types: "speech" (bubble) or "narration" (caption box)
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
        musicCue: "phone_ring",
        lines: [
          { type: "narration", text: "Lagos. A hot evening. Your phone won't stop ringing.", image: "assets/images/phone_call.webp" },
          { type: "speech", speaker: "Chika", side: "left", text: "Hello? Are you sitting down? I found you a job.", image: "assets/images/chika_call.webp" },
          { type: "speech", speaker: "You", side: "right", text: "Chika, if this is another one of your 'opportunities'...", image: "assets/images/phone_call.webp", pov: true },
          { type: "speech", speaker: "Chika", side: "left", text: "Five hundred thousand naira. One night. Babysitting.", image: "assets/images/chika_call.webp" },
          { type: "speech", speaker: "You", side: "right", text: "Five hundred— for babysitting? What's the catch?", image: "assets/images/phone_call.webp", pov: true },
          { type: "speech", speaker: "Chika", side: "left", text: "Just... follow the rules. Exactly. Don't ask too many questions. Please.", image: "assets/images/chika_worried.webp" },
          { type: "speech", speaker: "You", side: "right", text: "Chika? Why do you sound scared?", image: "assets/images/phone_call.webp", pov: true },
          { type: "speech", speaker: "Chika", side: "left", text: "The address is Wellington Estate. Gate 7. Be there before 7. And— good luck.", image: "assets/images/chika_worried.webp", sfx: "call_end" }
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
          { type: "speech", speaker: "Guard", side: "left", text: "Good luck.", image: "assets/images/guard_suspicious.webp", sfx: "gate_buzz" },
          { type: "narration", text: "He opens the gate slowly. Like he's not sure he should.", image: "assets/images/mansion_gate.webp" }
        ],
        next: "act1_mrs_o"
      },

      act1_mrs_o: {
        type: "dialogue",
        lines: [
          { type: "narration", text: "Inside the mansion. Everything is too quiet. Too clean.", image: "assets/images/mansion_interior.webp" },
          { type: "speech", speaker: "Mrs. Okonkwo", side: "left", text: "Ah. You came. Thank you. I was beginning to worry.", image: "assets/images/mrs_okonkwo_calm.webp" },
          { type: "speech", speaker: "You", side: "right", text: "Good evening, ma. Chika said you needed help tonight.", image: "assets/images/mansion_interior.webp", pov: true },
          { type: "speech", speaker: "Mrs. Okonkwo", side: "left", text: "Yes. Just one night. My baby, Ada, is sleeping upstairs. She is... a very special child.", image: "assets/images/mrs_okonkwo_calm.webp" },
          { type: "speech", speaker: "You", side: "right", text: "Special how?", image: "assets/images/mansion_interior.webp", pov: true },
          { type: "speech", speaker: "Mrs. Okonkwo", side: "left", text: "I will leave at 8 p.m. I will return at 6 a.m. While I am gone, you must follow my rules. Exactly.", image: "assets/images/mrs_okonkwo_serious.webp" },
          { type: "speech", speaker: "You", side: "right", text: "Okay... what are the rules?", image: "assets/images/mansion_interior.webp", pov: true }
        ],
        next: "act1_rules_dialogue"
      },

      act1_rules_dialogue: {
        type: "dialogue",
        lines: [
          { type: "speech", speaker: "Mrs. Okonkwo", side: "left", text: "Rule one. Never open the gate after 10 p.m. No matter who knocks. No matter what they say.", image: "assets/images/mrs_okonkwo_rule1.webp" },
          { type: "speech", speaker: "You", side: "right", text: "Not even if—", image: "assets/images/mansion_interior.webp", pov: true },
          { type: "speech", speaker: "Mrs. Okonkwo", side: "left", text: "No matter who.", image: "assets/images/mrs_okonkwo_rule1.webp" },
          { type: "speech", speaker: "Mrs. Okonkwo", side: "left", text: "Rule two. If the baby says he is hungry, give him only water. Nothing else.", image: "assets/images/mrs_okonkwo_rule2.webp" },
          { type: "speech", speaker: "You", side: "right", text: "He? I thought— never mind. Only water. Got it.", image: "assets/images/mansion_interior.webp", pov: true },
          { type: "speech", speaker: "Mrs. Okonkwo", side: "left", text: "Rule three. If the lights go out, go to the sitting room. Stay there until I am back. Do not move.", image: "assets/images/mrs_okonkwo_rule3.webp" },
          { type: "speech", speaker: "Mrs. Okonkwo", side: "left", text: "Rule four. If I call, I always start with 'Good night, Ada.' If a call starts any other way... do not answer.", image: "assets/images/mrs_okonkwo_rule4.webp" },
          { type: "speech", speaker: "You", side: "right", text: "That's... very specific.", image: "assets/images/mansion_interior.webp", pov: true },
          { type: "speech", speaker: "Mrs. Okonkwo", side: "left", text: "Rule five. Never tell anyone you are alone in this house.", image: "assets/images/mrs_okonkwo_rule5.webp" },
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
          "Never open the gate after 10 p.m., no matter who knocks.",
          "If the baby says he is hungry, give him only water.",
          "If the lights go out, go to the sitting room and stay there until I'm back.",
          "If I call, I always start with \"Good night, Ada.\" If a call starts any other way, don't answer.",
          "Never tell anyone you are alone in this house."
        ],
        next: "act1_departure"
      },

      act1_departure: {
        type: "dialogue",
        lines: [
          { type: "speech", speaker: "Mrs. Okonkwo", side: "left", text: "Good. I am leaving now. Remember everything.", image: "assets/images/mrs_okonkwo_leaving.webp" },
          { type: "speech", speaker: "You", side: "right", text: "Yes, ma. Have a safe trip.", image: "assets/images/mansion_interior.webp", pov: true },
          { type: "narration", text: "The car engine fades into the Lagos night.", image: "assets/images/car_leaving.webp", sfx: "car_drive" },
          { type: "narration", text: "You are alone in the house. With the baby. And the rules.", image: "assets/images/mansion_night.webp" },
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
          { type: "speech", speaker: "Man at Gate", side: "left", text: "Abeg, quick quick. I'm in a hurry.", image: "assets/images/gate_man.webp" }
        ],
        next: "act2_d1"
      },

      act2_d1: {
        type: "decision",
        id: "d1",
        prompt: "A man claims to be Mrs. Okonkwo's brother. What do you do?",
        image: "assets/images/gate_man.webp",
        timerSeconds: 5,
        choices: [
          { text: "Refuse. \"Come back in the morning.\"", correct: true },
          { text: "Open the gate for him.", correct: false, failTag: "gate" },
          { text: "\"I can't open the gate, I'm alone here.\"", correct: false, failTag: "alone" }
        ],
        nextCorrect: "act2_d1_correct",
        nextWrong: "act2_d1_wrong"
      },

      act2_d1_correct: {
        type: "dialogue",
        lines: [
          { type: "speech", speaker: "You", side: "right", text: "I'm sorry, sir. I can't open the gate. Please come back in the morning.", image: "assets/images/gate_night.webp", pov: true },
          { type: "speech", speaker: "Man at Gate", side: "left", text: "...Tch. Fine.", image: "assets/images/gate_man.webp" },
          { type: "narration", text: "Footsteps fade away. You exhale. Rule one held.", image: "assets/images/mansion_night.webp" }
        ],
        next: "act2_d2_setup"
      },

      act2_d1_wrong: {
        type: "failure_sequence",
        failTag: "gate",
        failTagScenes: {
          gate: [
            { type: "narration", text: "The gate creaks open. The man smiles too wide.", image: "assets/images/fail_gate_open.webp", sfx: "door_knock" },
            { type: "speech", speaker: "Man at Gate", side: "left", text: "Thank you. You're very... trusting.", image: "assets/images/fail_gate_man_smile.webp" },
            { type: "narration", text: "Two more shadows slip in behind him. You never see them coming.", image: "assets/images/fail_shadows.webp", sfx: "heartbeat" }
          ],
          alone: [
            { type: "narration", text: "You tell him you're alone. His smile changes.", image: "assets/images/fail_gate_man_smile.webp" },
            { type: "speech", speaker: "Man at Gate", side: "left", text: "Alone? That's... very useful to know.", image: "assets/images/fail_gate_man_smile.webp", sfx: "heartbeat" },
            { type: "narration", text: "He pulls out his phone. You realize you've said too much.", image: "assets/images/fail_shadows.webp" }
          ],
          timeout: [
            { type: "narration", text: "You freeze. Five seconds pass. The silence is your answer.", image: "assets/images/gate_man.webp", sfx: "heartbeat" },
            { type: "speech", speaker: "Man at Gate", side: "left", text: "Nobody there? Even better.", image: "assets/images/fail_gate_man_smile.webp" },
            { type: "narration", text: "You hear the gate rattle. He found another way in.", image: "assets/images/fail_shadows.webp" }
          ]
        },
        next: "game_over"
      },

      act2_d2_setup: {
        type: "dialogue",
        lines: [
          { type: "narration", text: "11:00 p.m. You settle into the couch. Maybe this won't be so bad.", image: "assets/images/sitting_room_calm.webp" },
          { type: "narration", text: "A small cry from upstairs. Then a voice. Soft. Too clear.", image: "assets/images/baby_room.webp", sfx: "baby_cry" },
          { type: "speech", speaker: "Baby Ada", side: "left", text: "I'm hungry.", image: "assets/images/baby_calm.webp" }
        ],
        next: "act2_d2"
      },

      act2_d2: {
        type: "decision",
        id: "d2",
        prompt: "The baby says he's hungry. What do you give him?",
        image: "assets/images/baby_calm.webp",
        timerSeconds: 5,
        choices: [
          { text: "Give him only water.", correct: true },
          { text: "Give him milk or food.", correct: false, failTag: "food" },
          { text: "Ignore him and go back downstairs.", correct: false, failTag: "ignore" }
        ],
        nextCorrect: "act2_d2_correct",
        nextWrong: "act2_d2_wrong"
      },

      act2_d2_correct: {
        type: "dialogue",
        lines: [
          { type: "speech", speaker: "You", side: "right", text: "Here you go, small one. Just water, okay?", image: "assets/images/baby_room.webp", pov: true },
          { type: "narration", text: "The baby drinks quietly. Those calm eyes never leave yours.", image: "assets/images/baby_calm.webp" },
          { type: "narration", text: "He smiles. You feel like you passed a test you didn't understand.", image: "assets/images/baby_calm.webp" }
        ],
        next: "act2_d3_setup"
      },

      act2_d2_wrong: {
        type: "failure_sequence",
        failTag: "food",
        failTagScenes: {
          food: [
            { type: "narration", text: "You warm some milk. The baby drinks eagerly. Too eagerly.", image: "assets/images/fail_baby_dark.webp", sfx: "baby_cry" },
            { type: "narration", text: "The room goes cold. The baby's eyes turn black.", image: "assets/images/fail_baby_dark.webp", sfx: "heartbeat" },
            { type: "narration", text: "You stumble back, but the door is already shut behind you.", image: "assets/images/fail_dark_hallway.webp" }
          ],
          ignore: [
            { type: "narration", text: "You walk away. The crying stops. That's worse.", image: "assets/images/fail_dark_hallway.webp", sfx: "heartbeat" },
            { type: "narration", text: "When you turn around, the baby is standing in the hallway.", image: "assets/images/fail_baby_hallway.webp" },
            { type: "narration", text: "Babies shouldn't stand like that.", image: "assets/images/fail_baby_hallway.webp" }
          ],
          timeout: [
            { type: "narration", text: "You hesitate too long. The baby's whisper becomes a scream.", image: "assets/images/fail_baby_dark.webp", sfx: "baby_cry" },
            { type: "narration", text: "The sound fills the house. Something else wakes up.", image: "assets/images/fail_dark_hallway.webp", sfx: "heartbeat" },
            { type: "narration", text: "You run, but the hallway keeps getting longer.", image: "assets/images/fail_dark_hallway.webp" }
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
        prompt: "The caller asks if you're alone. What do you do?",
        image: "assets/images/phone_ringing.webp",
        timerSeconds: 5,
        choices: [
          { text: "Don't answer. Let it ring out.", correct: true },
          { text: "Answer and talk to them.", correct: false, failTag: "answer" },
          { text: "Answer: \"Yes, I'm alone.\"", correct: false, failTag: "alone" }
        ],
        nextCorrect: "act2_d3_correct",
        nextWrong: "act2_d3_wrong"
      },

      act2_d3_correct: {
        type: "dialogue",
        lines: [
          { type: "narration", text: "You don't touch the phone. It rings... and rings... and stops.", image: "assets/images/phone_ringing.webp" },
          { type: "narration", text: "The silence after feels heavier than the ringing.", image: "assets/images/sitting_room_calm.webp" },
          { type: "speech", speaker: "You", side: "right", text: "No code words. No answer. I remember.", image: "assets/images/sitting_room_calm.webp", pov: true }
        ],
        next: "act2_d4_setup"
      },

      act2_d3_wrong: {
        type: "failure_sequence",
        failTag: "answer",
        failTagScenes: {
          answer: [
            { type: "narration", text: "You pick up. Breathing on the other end. Slow. Close.", image: "assets/images/phone_ringing.webp", sfx: "heartbeat" },
            { type: "speech", speaker: "Voice on Phone", side: "left", text: "Good. Now I know you're listening.", image: "assets/images/fail_phone_dark.webp" },
            { type: "narration", text: "The line goes dead. The front door handle turns.", image: "assets/images/fail_door_handle.webp", sfx: "door_knock" }
          ],
          alone: [
            { type: "narration", text: "\"Yes, I'm alone.\" The words leave your mouth before you think.", image: "assets/images/phone_ringing.webp", sfx: "heartbeat" },
            { type: "speech", speaker: "Voice on Phone", side: "left", text: "Thank you. That's all I needed.", image: "assets/images/fail_phone_dark.webp" },
            { type: "narration", text: "The call ends. Outside, a car door slams.", image: "assets/images/fail_shadows.webp" }
          ],
          timeout: [
            { type: "narration", text: "You stare at the phone too long. It stops ringing.", image: "assets/images/phone_ringing.webp", sfx: "heartbeat" },
            { type: "narration", text: "A text appears: \"I know you're there.\"", image: "assets/images/fail_phone_dark.webp" },
            { type: "narration", text: "The lights flicker. Something is very wrong.", image: "assets/images/fail_dark_hallway.webp" }
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
          { type: "narration", text: "A crash from the kitchen. Something fell. Or something moved.", image: "assets/images/dark_house.webp", sfx: "heartbeat" }
        ],
        next: "act2_d4"
      },

      act2_d4: {
        type: "decision",
        id: "d4",
        prompt: "Lights out. A noise in the kitchen. What do you do?",
        image: "assets/images/dark_house.webp",
        timerSeconds: 5,
        choices: [
          { text: "Go to the sitting room and stay there.", correct: true },
          { text: "Check the kitchen.", correct: false, failTag: "kitchen" },
          { text: "Run upstairs to the baby.", correct: false, failTag: "upstairs" }
        ],
        nextCorrect: "act2_d4_correct",
        nextWrong: "act2_d4_wrong"
      },

      act2_d4_correct: {
        type: "dialogue",
        lines: [
          { type: "narration", text: "You feel your way to the sitting room. Hands on the wall. Slow breaths.", image: "assets/images/dark_house.webp" },
          { type: "speech", speaker: "You", side: "right", text: "Sitting room. Stay put. Don't move. Don't be a hero.", image: "assets/images/dark_house.webp", pov: true },
          { type: "narration", text: "Minutes pass like hours. Then the lights flicker back on. The kitchen is empty.", image: "assets/images/sitting_room_calm.webp" }
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
            { type: "narration", text: "The curtain falls. Someone is standing behind it.", image: "assets/images/fail_kitchen_figure.webp", sfx: "heartbeat" }
          ],
          upstairs: [
            { type: "narration", text: "You run upstairs in the dark. Bad idea. You trip on the last step.", image: "assets/images/fail_dark_hallway.webp", sfx: "heartbeat" },
            { type: "narration", text: "From the baby's room, you hear a laugh. Not a baby's laugh.", image: "assets/images/fail_baby_hallway.webp" },
            { type: "narration", text: "The door slams shut. You're on the wrong side of it.", image: "assets/images/fail_dark_hallway.webp" }
          ],
          timeout: [
            { type: "narration", text: "You stand frozen in the dark. Five seconds. Too long.", image: "assets/images/dark_house.webp", sfx: "heartbeat" },
            { type: "narration", text: "Something brushes past your shoulder in the black.", image: "assets/images/fail_dark_hallway.webp" },
            { type: "narration", text: "You spin around. Nothing there. But the breathing is.", image: "assets/images/fail_kitchen_figure.webp" }
          ]
        },
        next: "game_over"
      },

      act2_d5_setup: {
        type: "dialogue",
        lines: [
          { type: "narration", text: "1:45 a.m. You're half-asleep on the couch when a shadow appears at the window.", image: "assets/images/neighbour_window.webp" },
          { type: "narration", text: "Tap. Tap. Tap.", image: "assets/images/neighbour_window.webp", sfx: "door_knock" },
          { type: "speech", speaker: "Neighbour", side: "left", text: "Psst! Sorry to disturb you. I saw the lights go off earlier. Is everything okay?", image: "assets/images/neighbour_window.webp" },
          { type: "speech", speaker: "Neighbour", side: "left", text: "Are you alone in there?", image: "assets/images/neighbour_close.webp" }
        ],
        next: "act2_d5"
      },

      act2_d5: {
        type: "decision",
        id: "d5",
        prompt: "A friendly neighbour asks if you're alone. What do you say?",
        image: "assets/images/neighbour_close.webp",
        timerSeconds: 5,
        choices: [
          { text: "\"No, the family is upstairs.\"", correct: true },
          { text: "\"Yes, I'm alone.\"", correct: false, failTag: "alone" },
          { text: "Stay silent and don't answer.", correct: false, failTag: "silent" }
        ],
        nextCorrect: "act2_d5_correct",
        nextWrong: "act2_d5_wrong"
      },

      act2_d5_correct: {
        type: "dialogue",
        lines: [
          { type: "speech", speaker: "You", side: "right", text: "Everything is fine, sir! The family is upstairs sleeping.", image: "assets/images/neighbour_window.webp", pov: true },
          { type: "speech", speaker: "Neighbour", side: "left", text: "Ah, okay. Just checking. Good night o.", image: "assets/images/neighbour_window.webp" },
          { type: "narration", text: "He walks away. You didn't tell him you're alone. Rule five. Safe.", image: "assets/images/sitting_room_calm.webp" }
        ],
        next: "act2_d6_setup"
      },

      act2_d5_wrong: {
        type: "failure_sequence",
        failTag: "alone",
        failTagScenes: {
          alone: [
            { type: "narration", text: "\"I'm alone.\" The neighbour's face changes — just for a second.", image: "assets/images/neighbour_close.webp", sfx: "heartbeat" },
            { type: "speech", speaker: "Neighbour", side: "left", text: "Alone... I see. Thank you for telling me.", image: "assets/images/fail_neighbour_sinister.webp" },
            { type: "narration", text: "He smiles and walks away. Five minutes later, you hear whispers outside every window.", image: "assets/images/fail_shadows.webp" }
          ],
          silent: [
            { type: "narration", text: "You say nothing. The silence stretches. The neighbour leans closer.", image: "assets/images/neighbour_close.webp", sfx: "heartbeat" },
            { type: "speech", speaker: "Neighbour", side: "left", text: "Hello? ...Nobody home? Interesting.", image: "assets/images/fail_neighbour_sinister.webp" },
            { type: "narration", text: "He makes a phone call as he walks away. Your stomach drops.", image: "assets/images/fail_shadows.webp" }
          ],
          timeout: [
            { type: "narration", text: "You freeze. Five seconds of silence is an answer all by itself.", image: "assets/images/neighbour_close.webp", sfx: "heartbeat" },
            { type: "speech", speaker: "Neighbour", side: "left", text: "No answer... so you ARE alone.", image: "assets/images/fail_neighbour_sinister.webp" },
            { type: "narration", text: "He disappears into the dark. You hear footsteps multiplying.", image: "assets/images/fail_shadows.webp" }
          ]
        },
        next: "game_over"
      },

      act2_d6_setup: {
        type: "dialogue",
        lines: [
          { type: "narration", text: "3:00 a.m. The darkest hour. Even Lagos is quiet.", image: "assets/images/mansion_night.webp" },
          { type: "narration", text: "Your phone rings again.", image: "assets/images/phone_ringing.webp", sfx: "phone_ring" },
          { type: "narration", text: "Unknown number. Your finger hovers over the screen.", image: "assets/images/phone_ringing.webp" },
          { type: "speech", speaker: "Voice on Phone", side: "left", text: "Good night, Ada...", image: "assets/images/phone_ringing.webp" }
        ],
        next: "act2_d6"
      },

      act2_d6: {
        type: "decision",
        id: "d6",
        prompt: "The caller starts with \"Good night, Ada...\" What do you do?",
        image: "assets/images/phone_ringing.webp",
        timerSeconds: 5,
        choices: [
          { text: "Answer the call.", correct: true },
          { text: "Ignore it — don't take the risk.", correct: false, failTag: "ignore" },
          { text: "Hang up immediately.", correct: false, failTag: "hangup" }
        ],
        nextCorrect: "act2_d6_correct",
        nextWrong: "act2_d6_wrong"
      },

      act2_d6_correct: {
        type: "dialogue",
        lines: [
          { type: "speech", speaker: "You", side: "right", text: "Hello? Mrs. Okonkwo?", image: "assets/images/phone_ringing.webp", pov: true },
          { type: "speech", speaker: "Mrs. Okonkwo (phone)", side: "left", text: "Good night, Ada. You remembered. I am close. Hold on a little longer.", image: "assets/images/phone_ringing.webp" },
          { type: "narration", text: "The line clicks off. The code was real. The mother was real. You breathe again.", image: "assets/images/sitting_room_calm.webp" }
        ],
        next: "act2_d7_setup"
      },

      act2_d6_wrong: {
        type: "failure_sequence",
        failTag: "ignore",
        failTagScenes: {
          ignore: [
            { type: "narration", text: "You let it ring. The code words fade into voicemail.", image: "assets/images/phone_ringing.webp", sfx: "heartbeat" },
            { type: "narration", text: "Your phone buzzes with a text: \"You didn't listen. I can't help you now.\"", image: "assets/images/fail_phone_dark.webp" },
            { type: "narration", text: "The house feels colder. You realize you just ignored the only person on your side.", image: "assets/images/fail_dark_hallway.webp" }
          ],
          hangup: [
            { type: "narration", text: "You slam the phone down. Silence.", image: "assets/images/phone_ringing.webp", sfx: "heartbeat" },
            { type: "narration", text: "Then a text: \"Wrong choice. I was trying to warn you.\"", image: "assets/images/fail_phone_dark.webp" },
            { type: "narration", text: "The front door creaks. Someone else got here first.", image: "assets/images/fail_door_handle.webp" }
          ],
          timeout: [
            { type: "narration", text: "You hesitate. The words \"Good night, Ada\" echo in your head, but your thumb won't move.", image: "assets/images/phone_ringing.webp", sfx: "heartbeat" },
            { type: "narration", text: "The call ends. You missed it. The one real call.", image: "assets/images/fail_phone_dark.webp" },
            { type: "narration", text: "The house seems to know. Every shadow leans closer.", image: "assets/images/fail_dark_hallway.webp" }
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
          { type: "speech", speaker: "Mrs. Okonkwo", side: "left", text: "Did you open the gate for anyone?", image: "assets/images/mrs_okonkwo_morning.webp" }
        ],
        next: "act2_d7"
      },

      act2_d7: {
        type: "decision",
        id: "d7",
        prompt: "Mrs. Okonkwo asks if you opened the gate for anyone. What do you say?",
        image: "assets/images/mrs_okonkwo_morning.webp",
        timerSeconds: 5,
        choices: [
          { text: "\"No, madam.\"", correct: true },
          { text: "\"Well... someone came, but I handled it.\"", correct: false, failTag: "confess" },
          { text: "Stay silent.", correct: false, failTag: "silent" }
        ],
        nextCorrect: "ending_win",
        nextWrong: "act2_d7_wrong"
      },

      act2_d7_wrong: {
        type: "failure_sequence",
        failTag: "confess",
        failTagScenes: {
          confess: [
            { type: "narration", text: "You start explaining. Too many words. Too much detail.", image: "assets/images/mrs_okonkwo_morning.webp", sfx: "heartbeat" },
            { type: "speech", speaker: "Mrs. Okonkwo", side: "left", text: "I only asked one question.", image: "assets/images/mrs_okonkwo_serious.webp" },
            { type: "narration", text: "Her smile doesn't reach her eyes. You realize you failed the last test.", image: "assets/images/fail_mrs_okonkwo_dark.webp" }
          ],
          silent: [
            { type: "narration", text: "You say nothing. The silence fills the room like water.", image: "assets/images/mrs_okonkwo_morning.webp", sfx: "heartbeat" },
            { type: "speech", speaker: "Mrs. Okonkwo", side: "left", text: "Silence is an answer too. Not the one I wanted.", image: "assets/images/mrs_okonkwo_serious.webp" },
            { type: "narration", text: "She turns away. The door behind you locks itself.", image: "assets/images/fail_mrs_okonkwo_dark.webp" }
          ],
          timeout: [
            { type: "narration", text: "Five seconds. You can't find the words. Your mouth is dry.", image: "assets/images/mrs_okonkwo_morning.webp", sfx: "heartbeat" },
            { type: "speech", speaker: "Mrs. Okonkwo", side: "left", text: "That's disappointing.", image: "assets/images/mrs_okonkwo_serious.webp" },
            { type: "narration", text: "She sighs, like a teacher grading a failed paper. You were so close.", image: "assets/images/fail_mrs_okonkwo_dark.webp" }
          ]
        },
        next: "game_over"
      },

      /* ===================== ENDING ===================== */
      ending_win: {
        type: "ending",
        lines: [
          { type: "speech", speaker: "You", side: "right", text: "No, madam.", image: "assets/images/mrs_okonkwo_morning.webp", pov: true },
          { type: "speech", speaker: "Mrs. Okonkwo", side: "left", text: "Good. Very good.", image: "assets/images/mrs_okonkwo_calm.webp" },
          { type: "narration", text: "She hands you an envelope. Thick. Heavy. Real.", image: "assets/images/payment_envelope.webp" },
          { type: "speech", speaker: "Mrs. Okonkwo", side: "left", text: "Five hundred thousand naira. You earned it.", image: "assets/images/payment_envelope.webp" },
          { type: "speech", speaker: "You", side: "right", text: "Thank you, ma. The baby... he's unusual.", image: "assets/images/baby_calm.webp", pov: true },
          { type: "speech", speaker: "Mrs. Okonkwo", side: "left", text: "He likes you. That's rare.", image: "assets/images/mrs_okonkwo_calm.webp" },
          { type: "narration", text: "As you walk to the gate, you glance back. Baby Ada is at the window upstairs.", image: "assets/images/baby_window.webp" },
          { type: "narration", text: "He waves. Slowly. Then he mouths two words you can somehow read from here:", image: "assets/images/baby_window.webp" },
          { type: "narration", text: "\"LEVEL TWO.\"", image: "assets/images/baby_window.webp", sfx: "heartbeat" },
          { type: "narration", text: "Your phone buzzes. A new message from an unknown number: \"Same time next week?\"", image: "assets/images/phone_ringing.webp" }
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

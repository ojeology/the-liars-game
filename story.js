/**
 * The Liar's Game - Episode 1: ROOM 412
 *
 * DATA-DRIVEN STORY FILE
 * ----------------------
 * All episode content lives here. The engine (game.js) reads this data.
 * To add Episode 2: create EPISODES.room413 (or similar) following the same schema.
 *
 * Scene types: title | dialogue | inspection | decision | failure_sequence | ending | game_over | win
 * Line types: "speech" (bubble) | "narration" (caption box)
 * Choice: { text, correct: bool, failTag: string }
 */

const EPISODES = {
  room412: {
    id: "room412",
    title: "The Liar's Game",
    subtitle: "Episode 1: Room 412",
    startScene: "title_screen",
    scenes: {

      /* ===================== TITLE ===================== */
      title_screen: {
        type: "title",
        image: "assets/images/r412_title.webp",
        heading: "THE LIAR'S GAME",
        subheading: "Episode 1: Room 412",
        prompt: "Tap to begin",
        next: "act1_intro"
      },

      /* ===================== ACT 1: THE ROOM ===================== */
      act1_intro: {
        type: "dialogue",
        lines: [
          { type: "narration", text: "Elysium Hotel, Victoria Island, Lagos. 9:12 p.m.", image: "assets/images/r412_corridor.webp" },
          { type: "narration", text: "Room 412. Warm lamp light. Bad decisions.", image: "assets/images/r412_room_establishing.webp" },
          { type: "speech", speaker: "Kemi", side: "left", text: "Tunde, if your girlfriend catches you, I'm telling her I was here for event planning. Which is true. Technically.", image: "assets/images/r412_kemi_close.webp" },
          { type: "speech", speaker: "Tunde", side: "right", text: "Technically? Kemi, please. You're wearing the lanyard. You're literally holding the plan. I'm safe.", image: "assets/images/r412_tunde_pov.webp", pov: true },
          { type: "speech", speaker: "Kemi", side: "left", text: "Safe? You told her you were at the office. Your car is downstairs. Your phone location is on. You're not safe, you're performing miracles.", image: "assets/images/r412_kemi_close.webp" },
          { type: "speech", speaker: "Tunde", side: "right", text: "Relax. Amara's birthday is in three days. This surprise dinner has to be perfect. That's why you're here.", image: "assets/images/r412_tunde_pov.webp", pov: true },
          { type: "speech", speaker: "Kemi", side: "left", text: "Mmm. Just remember — if she hears my voice, I'll switch to full 'Elysium Hotel Events Coordinator' mode. I can even do the fake professional smile.", image: "assets/images/r412_kemi_close.webp" },
          { type: "speech", speaker: "Tunde", side: "right", text: "Please don't practice it now, you look like you're about to sell me insurance.", image: "assets/images/r412_tunde_pov.webp", pov: true },
          { type: "narration", text: "They laugh. For a second, everything feels harmless.", image: "assets/images/r412_room_establishing.webp" },
          { type: "narration", text: "Then—", image: "assets/images/r412_door.webp" },
          { type: "narration", text: "KNOCK. KNOCK. KNOCK.", image: "assets/images/r412_door.webp", sfx: "door_knock" },
          { type: "speech", speaker: "Kemi", side: "left", text: "Please tell me that's room service.", image: "assets/images/r412_kemi_close.webp" },
          { type: "speech", speaker: "Amara (outside)", side: "left", text: "Tunde. I know you're in there.", image: "assets/images/r412_door_shadow.webp" },
          { type: "narration", text: "Kemi's eyes go wide. Tunde's soul leaves his body.", image: "assets/images/r412_tunde_nervous.webp", sfx: "heartbeat" },
          { type: "speech", speaker: "Tunde", side: "right", text: "Okay. Okay. Don't panic. We have clues. We have a story. We have... small faith.", image: "assets/images/r412_tunde_pov.webp", pov: true }
        ],
        next: "act1_inspection"
      },

      act1_inspection: {
        type: "inspection",
        image: "assets/images/r412_room_establishing.webp",
        heading: "Find Your Alibi",
        prompt: "Inspect every clue before you answer the door.",
        clues: [
          {
            id: "gift_bag",
            title: "Gift Bag",
            image: "assets/images/r412_gift_bag.webp",
            description: "A gift bag with a wrapped present inside and a birthday card addressed to Amara. If she sees this, the surprise-dinner story gets a lot more believable."
          },
          {
            id: "tablet",
            title: "Tablet",
            image: "assets/images/r412_tablet.webp",
            description: "An unread Elysium Events Team email confirms a surprise birthday dinner booking for Saturday. Real proof — if you can show it without fumbling."
          },
          {
            id: "lanyard",
            title: "Kemi's Lanyard",
            image: "assets/images/r412_lanyard.webp",
            description: "Kemi's lanyard reads: ELYSIUM HOTEL — EVENTS COORDINATOR. Her professional identity is the backbone of your cover story."
          }
        ],
        next: "act1_knock"
      },

      act1_knock: {
        type: "dialogue",
        lines: [
          { type: "narration", text: "Another knock. Harder this time.", image: "assets/images/r412_door.webp", sfx: "door_knock" },
          { type: "speech", speaker: "Amara (outside)", side: "left", text: "Tunde. I tracked your phone. I saw your car downstairs. Open this door.", image: "assets/images/r412_door_shadow.webp" },
          { type: "speech", speaker: "Kemi", side: "left", text: "She tracked your phone? Tunde, are you a boyfriend or a fugitive?", image: "assets/images/r412_kemi_close.webp" },
          { type: "speech", speaker: "Tunde", side: "right", text: "Shhh. I can do this. I just need to sound calm. Calm people don't get caught. Right?", image: "assets/images/r412_tunde_nervous.webp", pov: true }
        ],
        next: "d1"
      },

      /* ===================== ACT 2: THE SIX DECISIONS ===================== */
      d1: {
        type: "decision",
        id: "d1",
        prompt: "Amara knocks. What do you do?",
        image: "assets/images/r412_door.webp",
        timerSeconds: 8,
        choices: [
          { text: "Speak calmly through the closed door: \"Amara? Babe, what are you doing here?\"", correct: true, failTag: "correct" },
          { text: "Remain quiet and hope she leaves.", correct: false, failTag: "quiet" },
          { text: "Open the door slightly before responding.", correct: false, failTag: "open" }
        ],
        nextCorrect: "d1_correct",
        nextWrong: "d1_wrong"
      },

      d1_correct: {
        type: "dialogue",
        lines: [
          { type: "speech", speaker: "Tunde", side: "right", text: "Amara? Babe, what are you doing here?", image: "assets/images/r412_door.webp", pov: true },
          { type: "narration", text: "Your voice is calm. Almost suspiciously calm. But it works.", image: "assets/images/r412_door_shadow.webp" },
          { type: "speech", speaker: "Amara (outside)", side: "left", text: "Don't 'babe' me. I tracked your phone. Your car is in the parking lot. And reception told me you checked in at 8:40 p.m. with a woman.", image: "assets/images/r412_amara_close.webp" },
          { type: "speech", speaker: "Kemi", side: "left", text: "She has receipts. Actual receipts.", image: "assets/images/r412_kemi_close.webp" }
        ],
        next: "d2_setup"
      },

      d1_wrong: {
        type: "failure_sequence",
        failTag: "quiet",
        failTagScenes: {
          quiet: [
            { type: "narration", text: "You stay silent. Maybe if you don't move, Lagos problems will disappear.", image: "assets/images/r412_door.webp", sfx: "heartbeat" },
            { type: "speech", speaker: "Amara (outside)", side: "left", text: "Tunde, I can hear you breathing. Reception already told me you checked in with a woman.", image: "assets/images/r412_door_shadow.webp" },
            { type: "narration", text: "She signals the receptionist. A master key beeps. The door swings open.", image: "assets/images/r412_fail_keycard.webp", sfx: "keycard_beep" },
            { type: "narration", text: "Amara steps inside and sees Kemi frozen by the lamp. The silence says everything.", image: "assets/images/r412_caught.webp" }
          ],
          open: [
            { type: "narration", text: "You crack the door open before thinking. Amateur move.", image: "assets/images/r412_door_handle.webp", sfx: "door_handle" },
            { type: "speech", speaker: "Amara (outside)", side: "left", text: "Why are you hiding the room? Move.", image: "assets/images/r412_amara_close.webp" },
            { type: "narration", text: "She pushes the door wider. Kemi tries to duck behind the curtain and fails miserably.", image: "assets/images/r412_kemi_hiding.webp" },
            { type: "narration", text: "Amara walks in, looks at Kemi, then at you. Game over.", image: "assets/images/r412_caught.webp" }
          ],
          timeout: [
            { type: "narration", text: "Eight seconds pass. You say nothing. The hallway hears your panic.", image: "assets/images/r412_door.webp", sfx: "heartbeat" },
            { type: "speech", speaker: "Amara (outside)", side: "left", text: "So you can't even answer? Interesting.", image: "assets/images/r412_door_shadow.webp" },
            { type: "narration", text: "She calls reception. Mr. Bassey arrives with the master key, apologizing with his whole face.", image: "assets/images/r412_fail_keycard.webp", sfx: "keycard_beep" },
            { type: "narration", text: "The door opens. Amara sees Kemi. Your time ran out — so did your lie.", image: "assets/images/r412_caught.webp" }
          ]
        },
        next: "game_over"
      },

      d2_setup: {
        type: "dialogue",
        lines: [
          { type: "speech", speaker: "Amara (outside)", side: "left", text: "You told me you were 'stuck at the office, big client deadline.' So why is your car here? Why did reception say you checked in with a woman?", image: "assets/images/r412_amara_close.webp" },
          { type: "speech", speaker: "Tunde", side: "right", text: "Think, Tunde. Think. She already knows too much.", image: "assets/images/r412_tunde_nervous.webp", pov: true }
        ],
        next: "d2"
      },

      d2: {
        type: "decision",
        id: "d2",
        prompt: "Amara knows about the car and the check-in. What's your move?",
        image: "assets/images/r412_door_shadow.webp",
        timerSeconds: 8,
        choices: [
          { text: "\"Yes, I'm here. Kemi is with me, and that is exactly why I lied about the office.\"", correct: true, failTag: "correct" },
          { text: "Claim the receptionist identified the wrong person.", correct: false, failTag: "deny" },
          { text: "Claim the woman was simply delivering something for a client.", correct: false, failTag: "delivery" }
        ],
        nextCorrect: "d2_correct",
        nextWrong: "d2_wrong"
      },

      d2_correct: {
        type: "dialogue",
        lines: [
          { type: "speech", speaker: "Tunde", side: "right", text: "Yes, I'm here. Kemi is with me, and that is exactly why I lied about the office.", image: "assets/images/r412_door.webp", pov: true },
          { type: "speech", speaker: "Amara (outside)", side: "left", text: "...You admit it? Just like that?", image: "assets/images/r412_amara_close.webp" },
          { type: "speech", speaker: "Tunde", side: "right", text: "I can explain. Just... let me explain properly.", image: "assets/images/r412_tunde_pov.webp", pov: true },
          { type: "narration", text: "A risky truth, wrapped inside a bigger lie. Amara pauses. She's listening.", image: "assets/images/r412_door_shadow.webp" }
        ],
        next: "d3_setup"
      },

      d2_wrong: {
        type: "failure_sequence",
        failTag: "deny",
        failTagScenes: {
          deny: [
            { type: "narration", text: "You deny it. Bad idea. Amara doesn't bluff — she verifies.", image: "assets/images/r412_door.webp", sfx: "heartbeat" },
            { type: "speech", speaker: "Amara (outside)", side: "left", text: "Wrong person? Okay. Let me check again.", image: "assets/images/r412_amara_close.webp" },
            { type: "narration", text: "Downstairs, Mr. Bassey nervously confirms: \"Yes ma, Mr. Tunde. Room 412. With a lady.\" Loud enough for the corridor to hear.", image: "assets/images/r412_fail_reception.webp", sfx: "phone_buzz" },
            { type: "narration", text: "Amara comes back with security. The door opens. Kemi is right there. Your denial collapses.", image: "assets/images/r412_caught.webp" }
          ],
          delivery: [
            { type: "narration", text: "You try the 'delivery' story. It sounds thin the moment it leaves your mouth.", image: "assets/images/r412_tunde_nervous.webp", sfx: "heartbeat" },
            { type: "speech", speaker: "Amara (outside)", side: "left", text: "A delivery? At 8:40 p.m.? In a hotel room? Tunde, do I look like Wi-Fi?", image: "assets/images/r412_amara_close.webp" },
            { type: "narration", text: "She asks Mr. Bassey to describe the woman. 'She came in with him, ma.'", image: "assets/images/r412_fail_reception.webp" },
            { type: "narration", text: "Amara pushes past you when the door opens. Kemi is standing there with no delivery package in sight.", image: "assets/images/r412_caught.webp" }
          ],
          timeout: [
            { type: "narration", text: "You take too long. Silence gives Amara room to fill in the worst story.", image: "assets/images/r412_door_shadow.webp", sfx: "heartbeat" },
            { type: "speech", speaker: "Amara (outside)", side: "left", text: "You can't even explain it? That's all I need to know.", image: "assets/images/r412_amara_close.webp" },
            { type: "narration", text: "She gets Mr. Bassey and a security guard. The master key turns.", image: "assets/images/r412_fail_keycard.webp", sfx: "keycard_beep" },
            { type: "narration", text: "The door opens. Amara sees Kemi. Your hesitation did the confessing for you.", image: "assets/images/r412_caught.webp" }
          ]
        },
        next: "game_over"
      },

      d3_setup: {
        type: "dialogue",
        lines: [
          { type: "speech", speaker: "Amara (outside)", side: "left", text: "I heard a woman's voice in there, Tunde. Don't insult me. Who is she?", image: "assets/images/r412_amara_close.webp" },
          { type: "speech", speaker: "Kemi", side: "left", text: "She heard me. Of course she heard me. I laugh like a generator.", image: "assets/images/r412_kemi_close.webp" },
          { type: "speech", speaker: "Tunde", side: "right", text: "Okay. This is it. Kemi has to play her part. But how?", image: "assets/images/r412_tunde_nervous.webp", pov: true }
        ],
        next: "d3"
      },

      d3: {
        type: "decision",
        id: "d3",
        prompt: "Amara heard a woman's voice. Who is Kemi?",
        image: "assets/images/r412_kemi_close.webp",
        timerSeconds: 8,
        choices: [
          { text: "Whisper to Kemi to introduce herself professionally as an Elysium Hotel Events Coordinator.", correct: true, failTag: "correct" },
          { text: "Tell her to claim she is an old family friend.", correct: false, failTag: "friend" },
          { text: "Tell her to remain hidden and pretend to be hotel staff.", correct: false, failTag: "hide" }
        ],
        nextCorrect: "d3_correct",
        nextWrong: "d3_wrong"
      },

      d3_correct: {
        type: "dialogue",
        lines: [
          { type: "speech", speaker: "Tunde", side: "right", text: "Kemi, go on. Professional mode. Now.", image: "assets/images/r412_tunde_pov.webp", pov: true },
          { type: "speech", speaker: "Kemi", side: "left", text: "Good evening, madam. My name is Kemi, Events Coordinator with Elysium Hotel. I'm here assisting Mr. Tunde with a private event arrangement.", image: "assets/images/r412_kemi_close.webp" },
          { type: "speech", speaker: "Amara (outside)", side: "left", text: "...Events coordinator? At this hour? In his room?", image: "assets/images/r412_amara_close.webp" },
          { type: "narration", text: "She sounds suspicious, but not convinced you're lying. The lanyard story has legs.", image: "assets/images/r412_door_shadow.webp" }
        ],
        next: "d4_setup"
      },

      d3_wrong: {
        type: "failure_sequence",
        failTag: "friend",
        failTagScenes: {
          friend: [
            { type: "narration", text: "You tell Kemi to play 'old family friend'. She tries. It sounds like bad improv.", image: "assets/images/r412_kemi_close.webp", sfx: "heartbeat" },
            { type: "speech", speaker: "Kemi", side: "left", text: "Ah! Good evening! I'm... Tunde's cousin's... family friend. From... church!", image: "assets/images/r412_kemi_hiding.webp" },
            { type: "speech", speaker: "Amara (outside)", side: "left", text: "Church? At 9 p.m.? In a hotel room? Tunde, open this door before I embarrass both of us.", image: "assets/images/r412_amara_angry.webp" },
            { type: "narration", text: "Amara gets a guard. The door opens. Kemi's fake family-friend smile dies on sight.", image: "assets/images/r412_caught.webp" }
          ],
          hide: [
            { type: "narration", text: "You whisper to Kemi to hide and stay quiet. She dives behind the curtain like a Nollywood stunt double.", image: "assets/images/r412_kemi_hiding.webp", sfx: "heartbeat" },
            { type: "speech", speaker: "Amara (outside)", side: "left", text: "Why are you whispering? Who is in there?", image: "assets/images/r412_door_shadow.webp" },
            { type: "narration", text: "Then it happens — Kemi's phone starts buzzing loudly on the bed.", image: "assets/images/r412_phone.webp", sfx: "phone_buzz" },
            { type: "narration", text: "Amara hears it. She forces the door open with the guard. Kemi is half-behind the curtain. Caught.", image: "assets/images/r412_caught.webp" }
          ],
          timeout: [
            { type: "narration", text: "You freeze. No instruction for Kemi. No story. Just panic.", image: "assets/images/r412_tunde_nervous.webp", sfx: "heartbeat" },
            { type: "speech", speaker: "Amara (outside)", side: "left", text: "I just heard her move. Tunde, I'm done waiting.", image: "assets/images/r412_amara_angry.webp" },
            { type: "narration", text: "Kemi accidentally knocks over a glass trying to hide. The sound gives everything away.", image: "assets/images/r412_kemi_hiding.webp" },
            { type: "narration", text: "Amara enters with security. Kemi is exposed. Your silence was the loudest confession.", image: "assets/images/r412_caught.webp" }
          ]
        },
        next: "game_over"
      },

      d4_setup: {
        type: "dialogue",
        lines: [
          { type: "speech", speaker: "Amara (outside)", side: "left", text: "Events coordinator? Fine. Then open the door. Let me see her. Let me see this 'event arrangement'.", image: "assets/images/r412_amara_close.webp" },
          { type: "speech", speaker: "Kemi", side: "left", text: "If she enters now, the surprise dinner is dead. And possibly us too.", image: "assets/images/r412_kemi_close.webp" },
          { type: "speech", speaker: "Tunde", side: "right", text: "I need a reason to keep that door closed... a good one.", image: "assets/images/r412_tunde_nervous.webp", pov: true }
        ],
        next: "d4"
      },

      d4: {
        type: "decision",
        id: "d4",
        prompt: "Amara demands to enter. How do you keep the door closed?",
        image: "assets/images/r412_door_handle.webp",
        timerSeconds: 8,
        choices: [
          { text: "\"If you come in, you'll see the surprise before Saturday.\"", correct: true, failTag: "correct" },
          { text: "Say the room is messy.", correct: false, failTag: "messy" },
          { text: "Say Tunde is changing clothes.", correct: false, failTag: "changing" }
        ],
        nextCorrect: "d4_correct",
        nextWrong: "d4_wrong"
      },

      d4_correct: {
        type: "dialogue",
        lines: [
          { type: "speech", speaker: "Tunde", side: "right", text: "Babe, if you come in now, you'll see the surprise before Saturday. Please. Just trust me this once.", image: "assets/images/r412_door.webp", pov: true },
          { type: "narration", text: "You dangle her birthday. Three days away. The one detail that makes the lie feel warm.", image: "assets/images/r412_gift_bag.webp" },
          { type: "speech", speaker: "Amara (outside)", side: "left", text: "...My birthday? You remembered?", image: "assets/images/r412_amara_close.webp" },
          { type: "speech", speaker: "Kemi", side: "left", text: "She's softening. Don't ruin it. Don't breathe weird.", image: "assets/images/r412_kemi_close.webp" }
        ],
        next: "d5_setup"
      },

      d4_wrong: {
        type: "failure_sequence",
        failTag: "messy",
        failTagScenes: {
          messy: [
            { type: "narration", text: "'The room is messy'? That's your big lie? Tunde, be serious.", image: "assets/images/r412_tunde_nervous.webp", sfx: "heartbeat" },
            { type: "speech", speaker: "Amara (outside)", side: "left", text: "Messy? Tunde, I have seen your real room. Move.", image: "assets/images/r412_amara_close.webp" },
            { type: "narration", text: "She calls reception. Mr. Bassey arrives, sweating, and offers the master key to 'resolve the situation'.", image: "assets/images/r412_receptionist.webp", sfx: "keycard_beep" },
            { type: "narration", text: "The key beeps. The door opens. Amara sees Kemi, the gift bag, the panic — all of it.", image: "assets/images/r412_caught.webp" }
          ],
          changing: [
            { type: "narration", text: "You say you're changing clothes. Amara's patience changes too — into anger.", image: "assets/images/r412_door.webp", sfx: "heartbeat" },
            { type: "speech", speaker: "Amara (outside)", side: "left", text: "Changing? In a hotel room you lied about? Open the door, Tunde.", image: "assets/images/r412_amara_angry.webp" },
            { type: "narration", text: "Mr. Bassey appears with the master key, mumbling apologies as he swipes it.", image: "assets/images/r412_fail_keycard.webp", sfx: "keycard_beep" },
            { type: "narration", text: "Door opens. No changing. Just Kemi, caught like a deer in designer sandals.", image: "assets/images/r412_caught.webp" }
          ],
          timeout: [
            { type: "narration", text: "You hesitate too long. A locked door with no explanation just looks guilty.", image: "assets/images/r412_door_handle.webp", sfx: "heartbeat" },
            { type: "speech", speaker: "Amara (outside)", side: "left", text: "You know what? I'm not doing this outside a door.", image: "assets/images/r412_amara_angry.webp" },
            { type: "narration", text: "She grabs Mr. Bassey from reception. Master key. No more excuses.", image: "assets/images/r412_fail_keycard.webp", sfx: "keycard_beep" },
            { type: "narration", text: "The door swings open. Amara sees Kemi. The room tells the truth you couldn't.", image: "assets/images/r412_caught.webp" }
          ]
        },
        next: "game_over"
      },

      d5_setup: {
        type: "dialogue",
        lines: [
          { type: "speech", speaker: "Amara (outside)", side: "left", text: "A surprise for my birthday? That's sweet, Tunde. Really sweet. So show me proof.", image: "assets/images/r412_amara_close.webp" },
          { type: "speech", speaker: "Tunde", side: "right", text: "Proof. Right. We have proof. Don't fumble this.", image: "assets/images/r412_tunde_nervous.webp", pov: true },
          { type: "speech", speaker: "Kemi", side: "left", text: "The card. The tablet. Pick one and don't be weird about it.", image: "assets/images/r412_kemi_close.webp" }
        ],
        next: "d5"
      },

      d5: {
        type: "decision",
        id: "d5",
        prompt: "Amara asks for evidence. What do you show her?",
        image: "assets/images/r412_door.webp",
        timerSeconds: 8,
        choices: [
          { text: "Slide the birthday card under the door or show the Elysium Events email on the tablet.", correct: true, failTag: "correct" },
          { text: "Claim the evidence is on a dead phone.", correct: false, failTag: "deadphone" },
          { text: "Send an unrelated hotel-room photograph.", correct: false, failTag: "photo" }
        ],
        nextCorrect: "d5_correct",
        nextWrong: "d5_wrong"
      },

      d5_correct: {
        type: "dialogue",
        lines: [
          { type: "narration", text: "You slide the birthday card under the door. The envelope brushes Amara's shoe.", image: "assets/images/r412_birthday_card.webp" },
          { type: "speech", speaker: "Amara (outside)", side: "left", text: "...This has my name on it. And this is your handwriting.", image: "assets/images/r412_amara_close.webp" },
          { type: "speech", speaker: "Tunde", side: "right", text: "I told you. Kemi's helping me set up Saturday. I just wanted it to be perfect.", image: "assets/images/r412_tunde_pov.webp", pov: true },
          { type: "narration", text: "Amara goes quiet. The dangerous kind of quiet. Then her voice softens.", image: "assets/images/r412_door_shadow.webp" }
        ],
        next: "d6_setup"
      },

      d5_wrong: {
        type: "failure_sequence",
        failTag: "deadphone",
        failTagScenes: {
          deadphone: [
            { type: "narration", text: "'My phone is dead.' The oldest excuse in the Lagos playbook.", image: "assets/images/r412_phone.webp", sfx: "heartbeat" },
            { type: "speech", speaker: "Amara (outside)", side: "left", text: "Your phone is dead? The same phone I tracked to this hotel ten minutes ago?", image: "assets/images/r412_amara_angry.webp" },
            { type: "narration", text: "She loses patience. No proof, no trust. She calls the guard over.", image: "assets/images/r412_fail_corridor.webp" },
            { type: "narration", text: "The door opens. Amara walks in and finds Kemi standing by the gift bag. No dead phone can save you now.", image: "assets/images/r412_caught.webp" }
          ],
          photo: [
            { type: "narration", text: "You panic-send a random hotel room photo. No card. No email. No brain.", image: "assets/images/r412_phone.webp", sfx: "phone_buzz" },
            { type: "speech", speaker: "Amara (outside)", side: "left", text: "Tunde... this is just a picture of a bed. What am I supposed to do with this?", image: "assets/images/r412_amara_angry.webp" },
            { type: "narration", text: "The weak proof backfires. She's angrier now. She demands the door open.", image: "assets/images/r412_fail_corridor.webp" },
            { type: "narration", text: "Security opens it. Amara steps in, sees Kemi, and holds up the useless photo. \"This was your proof?\"", image: "assets/images/r412_caught.webp" }
          ],
          timeout: [
            { type: "narration", text: "You fumble for proof. Card? Tablet? Words? Nothing comes out.", image: "assets/images/r412_tunde_nervous.webp", sfx: "heartbeat" },
            { type: "speech", speaker: "Amara (outside)", side: "left", text: "You had time to plan a whole surprise, but no time to show me one piece of proof?", image: "assets/images/r412_amara_angry.webp" },
            { type: "narration", text: "Her patience snaps. She gets the guard and the master key.", image: "assets/images/r412_fail_keycard.webp", sfx: "keycard_beep" },
            { type: "narration", text: "Door opens. Kemi is revealed. Your missing proof became the only proof Amara needed.", image: "assets/images/r412_caught.webp" }
          ]
        },
        next: "game_over"
      },

      d6_setup: {
        type: "dialogue",
        lines: [
          { type: "speech", speaker: "Amara (outside)", side: "left", text: "...Okay. Maybe I overreacted. I just — when I saw your location and heard a woman, I thought...", image: "assets/images/r412_amara_close.webp" },
          { type: "speech", speaker: "Tunde", side: "right", text: "I know, babe. I should've told you something. I just didn't want to ruin it.", image: "assets/images/r412_tunde_pov.webp", pov: true },
          { type: "speech", speaker: "Kemi", side: "left", text: "She's buying it. Land the plane, Tunde. Gently.", image: "assets/images/r412_kemi_close.webp" }
        ],
        next: "d6"
      },

      d6: {
        type: "decision",
        id: "d6",
        prompt: "Amara is starting to believe you. How do you close it?",
        image: "assets/images/r412_corridor.webp",
        timerSeconds: 8,
        choices: [
          { text: "Ask her to go home and promise to pick her up at 7 p.m. Saturday, dressed up.", correct: true, failTag: "correct" },
          { text: "Apologise repeatedly and beg her to forgive him immediately.", correct: false, failTag: "beg" },
          { text: "Ask her to wait in the hotel lobby.", correct: false, failTag: "lobby" }
        ],
        nextCorrect: "d6_correct",
        nextWrong: "d6_wrong"
      },

      d6_correct: {
        type: "dialogue",
        lines: [
          { type: "speech", speaker: "Tunde", side: "right", text: "Go home, babe. Let me finish this properly. I'll pick you up at 7 p.m. Saturday. Dress up. Trust me.", image: "assets/images/r412_door.webp", pov: true },
          { type: "speech", speaker: "Amara (outside)", side: "left", text: "...Okay. 7 p.m. Saturday. You better not be lying to me, Tunde.", image: "assets/images/r412_amara_close.webp" },
          { type: "speech", speaker: "Tunde", side: "right", text: "Me? Lie? Never.", image: "assets/images/r412_tunde_pov.webp", pov: true }
        ],
        next: "ending_win"
      },

      d6_wrong: {
        type: "failure_sequence",
        failTag: "beg",
        failTagScenes: {
          beg: [
            { type: "narration", text: "You start apologizing too much. Way too much. Guilt is leaking out of every word.", image: "assets/images/r412_tunde_nervous.webp", sfx: "heartbeat" },
            { type: "speech", speaker: "Amara (outside)", side: "left", text: "Why are you begging like that? People who planned a surprise don't sound this guilty.", image: "assets/images/r412_amara_angry.webp" },
            { type: "narration", text: "Your over-apology cracks the story. She demands to come in right now.", image: "assets/images/r412_door_handle.webp", sfx: "door_handle" },
            { type: "narration", text: "The door opens. Amara sees Kemi. All that begging, and the truth still won.", image: "assets/images/r412_caught.webp" }
          ],
          lobby: [
            { type: "narration", text: "You ask her to wait in the lobby. Calm. Reasonable. Catastrophic.", image: "assets/images/r412_corridor.webp", sfx: "heartbeat" },
            { type: "speech", speaker: "Amara (outside)", side: "left", text: "The lobby? ...Fine. Don't take long.", image: "assets/images/r412_amara_close.webp" },
            { type: "narration", text: "Amara turns to leave. At that exact moment, Kemi's phone buzzes — loud. A message lights up the room.", image: "assets/images/r412_fail_kemi_phone.webp", sfx: "phone_buzz" },
            { type: "narration", text: "Amara hears it, spins around, and pushes the door open. Kemi is right there. The lobby plan dies instantly.", image: "assets/images/r412_caught.webp" }
          ],
          timeout: [
            { type: "narration", text: "You had her. She was almost gone. But you waited too long to close.", image: "assets/images/r412_corridor.webp", sfx: "heartbeat" },
            { type: "speech", speaker: "Amara (outside)", side: "left", text: "Why are you suddenly quiet? You know what — I'm opening this door.", image: "assets/images/r412_amara_angry.webp" },
            { type: "narration", text: "She calls for Mr. Bassey. The keycard beeps. Your moment slips away.", image: "assets/images/r412_fail_keycard.webp", sfx: "keycard_beep" },
            { type: "narration", text: "Door opens. Amara sees Kemi. You almost lied your way out. Almost.", image: "assets/images/r412_caught.webp" }
          ]
        },
        next: "game_over"
      },

      /* ===================== WIN ENDING ===================== */
      ending_win: {
        type: "ending",
        lines: [
          { type: "narration", text: "Footsteps fade down the corridor. The shadow under the door disappears.", image: "assets/images/r412_corridor.webp" },
          { type: "speech", speaker: "Amara (outside)", side: "left", text: "Okay... I'm sorry for doubting you. I'll see you Saturday. Love you.", image: "assets/images/r412_amara_close.webp" },
          { type: "narration", text: "You wait until the elevator dings. Then your knees give up.", image: "assets/images/r412_room_establishing.webp" },
          { type: "narration", text: "Tunde slides down the wall and exhales like he just finished a marathon in a suit.", image: "assets/images/r412_tunde_pov.webp", pov: true },
          { type: "speech", speaker: "Kemi", side: "left", text: "Tunde... if you ever lie like that again, at least put me on payroll. I acted my life out.", image: "assets/images/r412_kemi_close.webp" },
          { type: "narration", text: "Your phone buzzes.", image: "assets/images/r412_phone.webp", sfx: "phone_buzz" },
          { type: "speech", speaker: "Amara (text)", side: "left", text: "Sorry for doubting you. Love you. 💕", image: "assets/images/r412_phone.webp" },
          { type: "narration", text: "You smile. You survived. You're a terrible person... but an excellent liar.", image: "assets/images/r412_win.webp" },
          { type: "narration", text: "Then another message arrives. Unknown number.", image: "assets/images/r412_phone.webp", sfx: "phone_buzz" },
          { type: "speech", speaker: "Unknown", side: "left", text: "Nice performance in Room 412. Ready for Episode 2?", image: "assets/images/r412_episode2_teaser.webp", sfx: "heartbeat" }
        ],
        next: "win_screen"
      },

      win_screen: {
        type: "win",
        image: "assets/images/r412_win.webp"
      },

      /* ===================== GAME OVER ===================== */
      game_over: {
        type: "game_over",
        image: "assets/images/r412_caught.webp",
        title: "YOU GOT CAUGHT.",
        message: "You're not good enough to be a liar."
      }
    }
  }
};

// Backward compatibility alias (engine may look for LEVELS)
const LEVELS = EPISODES;

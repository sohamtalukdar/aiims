const tasks = [
    {
      id: 0,
      title: { 
        hindi: 'पहला कार्य', 
        english: '1st Task' 
      },
      paragraph: {
        hindi: [
          'एक बार की बात है, एक छोटे से गाँव में, एक प्यारी सी बच्ची रहती थी। उसका नाम नीता था। नीता बचपन से ही बहुत ही समझदार थी। वह हमेशा अपने दादी के साथ खेलती और बातें करती थी। एक दिन, नीता के पास एक खास खिलौना आया। यह एक सुंदर सा किताब था, जिसमें फूलों के बारे में बहुत सी ख़ूबसूरत तस्वीरें थीं। नीता ने दादी के साथ उस किताब को देखकर खुशी-खुशी पढ़ना शुरू किया। उसके बाद, नीता ने अपने दोस्तों को भी वो किताब दिखाई और सबको फूलों के बारे में बताया। और सबको यह सिखाया कि प्रकृति की सुंदर सी चीजों को सबको समझने का अवसर मिलता है। इस कहानी का संदेश है कि हमें प्रकृति की सुंदरता को समझने और महसूस करने का समय निकालना चाहिए, और हमें अपने परिवार और दोस्तों के साथ उसे साझा करना चाहिए।'
        ],
        english: [
          'Once upon a time, in a small village, there was a lovely little girl named Neeta. Neeta was very wise from a young age. She would always play with her grandmother and chat with her. One day, Neeta got a special toy, a beautiful book with many lovely pictures of flowers. She happily started reading it with her grandmother. Later, she showed the book to her friends and told them about the flowers, teaching everyone about the beauty of nature. The message of this story is that we should take time to understand and appreciate nature\'s beauty and share it with family and friends.'
        ]
      }
    },
    {
      id: 1,
      title: { hindi: 'दूसरा कार्य', english: '2nd Task' },
      image: '/image.png',
    },
    {
      id: 2,
      title: { hindi: 'तीसरा कार्य', english: '3rd Task' },
      questions: [
        {
          question: { hindi: 'यह कौन सा है?', english: 'What is the' },
          choices: [
            { hindi: 'वर्ष', english: 'Year' },
            { hindi: 'ऋतु', english: 'Season' },
            { hindi: 'सप्ताह का दिन', english: 'Day of the week' },
            { hindi: 'महीना', english: 'Month' },
            { hindi: 'तारीख', english: 'Date' }
          ],
          answer: null, // User's selected answer
        },
        {
          question: { hindi: 'हम अभी कहाँ हैं?', english: 'Where are we now' },
          choices: [
            { hindi: 'राज्य', english: 'State' },
            { hindi: 'देश', english: 'Country' },
            { hindi: 'शहर/नगर', english: 'Town/City' },
            { hindi: 'अस्पताल', english: 'Hospital' },
            { hindi: 'मंज़िल', english: 'Floor' }
          ],
          answer: null, // User's selected answer
        },
        {
          question: { hindi: '3 असंबंधित वस्तुओं का नाम बताएं, विषय से उन्हें अब दोहराने और बाद में याद रखने के लिए कहें। उदाहरण:', english: 'Name 3 unrelated objects, ask subject to recite them now and remember them for later. e.g.' },
          choices: [
            { hindi: 'सेब', english: 'Apple' },
            { hindi: 'मेज़', english: 'Table' },
            { hindi: 'पैसा', english: 'Penny' }
          ],
          answer: null, // User's selected answer
        },
        {
          question: { hindi: '100 से पीछे की ओर सात-सात करके गिनती करें', english: 'Count backward from 100 by sevens' },
          choices: [
            { hindi: '93', english: '93' },
            { hindi: '86', english: '86' },
            { hindi: '79', english: '79' },
            { hindi: '72', english: '72' },
            { hindi: '65', english: '65' }
          ],
          answer: null, // User's selected answer
        },
        {
          question: { hindi: 'पहले याद करने को कहा गया तीन चीज़ों का नाम बताएं:', english: 'Name the three things asked to remember earlier:' },
          choices: [
            { hindi: 'सेब', english: 'Apple' },
            { hindi: 'मेज़', english: 'Table' },
            { hindi: 'पैसा', english: 'Penny' }
          ],
          answer: null, // User's selected answer
        },
        {
          question: { hindi: 'रोगी को दिखाई गई वस्तुओं का नाम बताएं:', english: 'Name objects shown to patient:' },
          choices: [
            { hindi: 'कलाई घड़ी या घड़ी', english: 'Wristwatch or Clock' },
            { hindi: 'पेन या पेंसिल', english: 'Pen or Pencil' }
          ],
          answer: null, // User's selected answer
        },
        {
          question: { hindi: 'वाक्य को दोहराएं:', english: 'Repeat the phrase:' },
          choices: [
            { hindi: '"नहीं अगर, और, या परन्तु"', english: '"No ifs, ands, or buts."' }
          ],
          answer: null, // User's selected answer
        },
        {
          question: { hindi: 'रोगी से इन निर्देशों का पालन करने के लिए कहें:', english: 'Ask the patient to follow these instructions:' },
          choices: [
            { hindi: 'कागज़ को अपने दाएं हाथ में लें', english: 'Take the paper in your right hand' },
            { hindi: 'इसे आधा मोड़ें', english: 'Fold it in half' },
            { hindi: 'और इसे फर्श पर रखें', english: 'And put it on the floor' }
          ],
          answer: null, // User's selected answer
        },
        {
          question: { hindi: 'रोगी से निम्नलिखित निर्देश पढ़ने और उसका पालन करने के लिए कहें:', english: 'Ask the patient to read the following instruction and follow it:' },
          choices: [
            { hindi: '"अपनी आँखें बंद करें"', english: '"Close your eyes"' }
          ],
          answer: null, // User's selected answer
        },
        {
          question: { hindi: 'रोगी से निम्नलिखित निर्देश पढ़ने और उसका पालन करने के लिए कहें:', english: 'Ask the patient to read the following instruction and follow it:' },
          choices: [
            { hindi: 'निर्देश का पालन किया गया', english: 'Instruction followed' }
          ],
          answer: null, // User's selected answer
        },
        {
          question: { hindi: 'रोगी से कुछ भी एक वाक्य बनाकर लिखने के लिए कहें, जिसमें एक संज्ञा और एक क्रिया हो, कागज़ पर:', english: 'Ask the patient to make up and write a sentence about anything, which contains a noun and a verb on the blank paper:' },
          choices: [
            { hindi: 'वाक्य स्वीकार्य है', english: 'Sentence acceptable' }
          ],
          answer: null, // User's selected answer
        },
        {
          question: { hindi: 'रोगी से इस चित्र को कागज़ पर कॉपी करने के लिए कहें:', english: 'Ask the patient to copy this picture on the blank paper:' },
          choices: [
            { hindi: 'चित्र स्वीकार्य', english: 'Picture acceptable' } // Leave blank if image will be shown instead of choices
          ],
          answer: null, // User's selected answer
        },   
      ]
    }
  ];

export default tasks;
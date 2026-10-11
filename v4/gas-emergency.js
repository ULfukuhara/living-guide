// Municipality routing from Osaka Gas Network's gas-leak emergency list.
// Addresses do not identify gas suppliers: require an explicitly configured network operator.
export const GAS_EMERGENCY_SOURCE = 'https://network.osakagas.co.jp/contact/index.html#gasleak';
export const GAS_EMERGENCY_CHECKED_ON = '2026-10-11';
const groups = [
  {
    "region": "大阪事業部",
    "phone": "0120-0-19424",
    "areas": {
      "大阪府": [
        "大阪市"
      ]
    }
  },
  {
    "region": "南部事業部",
    "phone": "0120-3-19424",
    "areas": {
      "大阪府": [
        "堺市",
        "岸和田市",
        "泉大津市",
        "貝塚市",
        "泉佐野市",
        "富田林市",
        "河内長野市",
        "松原市",
        "和泉市",
        "羽曳野市",
        "高石市",
        "藤井寺市",
        "泉南市",
        "大阪狭山市",
        "阪南市",
        "忠岡町",
        "熊取町",
        "田尻町",
        "岬町",
        "太子町",
        "河南町"
      ],
      "和歌山県": [
        "和歌山市",
        "海南市",
        "岩出市"
      ]
    }
  },
  {
    "region": "北東部事業部",
    "phone": "0120-5-19424",
    "areas": {
      "大阪府": [
        "豊中市",
        "池田市",
        "吹田市",
        "高槻市",
        "守口市",
        "枚方市",
        "茨木市",
        "八尾市",
        "寝屋川市",
        "大東市",
        "箕面市",
        "柏原市",
        "門真市",
        "摂津市",
        "東大阪市",
        "四條畷市",
        "交野市",
        "島本町"
      ],
      "奈良県": [
        "奈良市",
        "大和高田市",
        "大和郡山市",
        "天理市",
        "生駒市",
        "香芝市",
        "平群町",
        "三郷町",
        "斑鳩町",
        "安堵町",
        "川西町",
        "田原本町",
        "上牧町",
        "王寺町",
        "広陵町",
        "河合町"
      ],
      "京都府": [
        "八幡市",
        "京田辺市",
        "木津川市",
        "精華町"
      ]
    }
  },
  {
    "region": "兵庫事業部",
    "phone": "0120-7-19424",
    "areas": {
      "兵庫県": [
        "神戸市",
        "姫路市",
        "尼崎市",
        "明石市",
        "西宮市",
        "芦屋市",
        "伊丹市",
        "相生市",
        "加古川市",
        "赤穂市",
        "宝塚市",
        "三木市",
        "高砂市",
        "川西市",
        "小野市",
        "三田市",
        "加西市",
        "加東市",
        "たつの市",
        "猪名川町",
        "稲美町",
        "播磨町",
        "太子町",
        "上郡町",
        "佐用町"
      ],
      "大阪府": [
        "豊能町",
        "能勢町"
      ],
      "岡山県": [
        "備前市"
      ]
    }
  },
  {
    "region": "京滋事業部",
    "phone": "0120-8-19424",
    "areas": {
      "京都府": [
        "京都市",
        "宇治市",
        "亀岡市",
        "城陽市",
        "向日市",
        "長岡京市",
        "大山崎町",
        "久御山町",
        "井手町",
        "宇治田原町"
      ],
      "滋賀県": [
        "大津市",
        "彦根市",
        "長浜市",
        "近江八幡市",
        "草津市",
        "守山市",
        "栗東市",
        "甲賀市",
        "野洲市",
        "湖南市",
        "東近江市",
        "米原市",
        "日野町",
        "竜王町",
        "愛荘町",
        "甲良町",
        "多賀町"
      ]
    }
  }
];
export function gasEmergencyContact(operator, address) {
  if (operator !== 'osaka_gas_network' || typeof address !== 'string') return null;
  const normalized = address.normalize('NFKC').replace(/\s|〒\d{3}-?\d{4}/g, '');
  const matches = [];
  for (const group of groups) for (const [prefecture, municipalities] of Object.entries(group.areas)) {
    if (!normalized.startsWith(prefecture)) continue;
    const local = normalized.slice(prefecture.length);
    for (const municipality of municipalities) if (local.startsWith(municipality) || new RegExp('^[^市町村]+郡' + municipality).test(local)) matches.push({operator, prefecture, municipality, region:group.region, phone:group.phone, href:'tel:'+group.phone.replace(/-/g,''), hours:'24時間・365日', source:GAS_EMERGENCY_SOURCE, checkedOn:GAS_EMERGENCY_CHECKED_ON});
  }
  return matches.length === 1 ? matches[0] : null;
}

import { SvgIconComponent } from '@mui/icons-material';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import CampaignIcon from '@mui/icons-material/Campaign';
import WorkIcon from '@mui/icons-material/Work';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import ElectricScooterIcon from '@mui/icons-material/ElectricScooter';
import HomeIcon from '@mui/icons-material/Home';
import PhoneIphoneIcon from '@mui/icons-material/PhoneIphone';
import ComputerIcon from '@mui/icons-material/Computer';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import StyleIcon from '@mui/icons-material/Style';
import ToysIcon from '@mui/icons-material/Toys';
import ChildFriendlyIcon from '@mui/icons-material/ChildFriendly';
import ChairIcon from '@mui/icons-material/Chair';
import DeckIcon from '@mui/icons-material/Deck';
import StorefrontIcon from '@mui/icons-material/Storefront';
import FastfoodIcon from '@mui/icons-material/Fastfood';
import BakeryDiningIcon from '@mui/icons-material/BakeryDining';
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import PetsIcon from '@mui/icons-material/Pets';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import CheckroomIcon from '@mui/icons-material/Checkroom';
import DesignServicesIcon from '@mui/icons-material/DesignServices';
import CodeIcon from '@mui/icons-material/Code';
import ElectricalServicesIcon from '@mui/icons-material/ElectricalServices';
import SportsIcon from '@mui/icons-material/Sports';
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';

export interface SubCategory {
  id: string;
  names: { [key: string]: string };
}

export interface Category {
  id: string;
  names: { [key: string]: string };
  icon: SvgIconComponent;
  subCategories?: SubCategory[];
}

export const categories: Category[] = [
  { id: 'tickets', names: { th: 'ตั๋ว & อีเวนท์', en: 'Tickets & Events', ja: 'チケット＆イベント', ko: '티켓 및 이벤트', zh: '门票与活动', hi: 'टिकट और इवेंट' }, icon: ConfirmationNumberIcon, subCategories: [
    { id: 'concerts', names: { th: 'บัตรคอนเสิร์ต', en: 'Concert Tickets', ja: 'コンサートチケット', ko: '콘서트 티켓', zh: '演唱会门票', hi: 'संगीत कार्यक्रम के टिकट' } },
    { id: 'sports_tickets', names: { th: 'บัตรกีฬา', en: 'Sports Tickets', ja: 'スポーツチケット', ko: '스포츠 티켓', zh: '体育赛事门票', hi: 'खेल के टिकट' } },
  ]},
  { id: 'kol', names: { th: 'KOL & Influencer', en: 'KOL & Influencer', ja: 'KOL・インフルエンサー', ko: 'KOL 및 인플루언서', zh: 'KOL与网红', hi: 'KOL और इन्फ्लुएंसर' }, icon: CampaignIcon },
  { id: 'jobs', names: { th: 'งาน', en: 'Jobs', ja: '求人', ko: '채용', zh: '招聘', hi: 'नौकरियां' }, icon: WorkIcon },
  { id: 'cars', names: { th: 'รถยนต์', en: 'Cars', ja: '自動車', ko: '자동차', zh: '汽车', hi: 'गाड़ियां' }, icon: DirectionsCarIcon },
  { id: 'alt_vehicles', names: { th: 'ยานพาหนะอื่นๆ', en: 'Other Vehicles', ja: 'その他の車両', ko: '기타 차량', zh: '其他车辆', hi: 'अन्य वाहन' }, icon: ElectricScooterIcon },
  { id: 'homes', names: { th: 'บ้านและคอนโด', en: 'Homes & Condos', ja: '住宅・コンドミニアム', ko: '주택 및 콘도', zh: '房屋与公寓', hi: 'घर और कोंडो' }, icon: HomeIcon },
  { id: 'phones', names: { th: 'โทรศัพท์และแท็บเล็ต', en: 'Phones & Tablets', ja: 'スマートフォン・タブレット', ko: '휴대폰 및 태블릿', zh: '手机与平板电脑', hi: 'फोन और टैबलेट' }, icon: PhoneIphoneIcon },
  { id: 'computers', names: { th: 'คอมพิวเตอร์', en: 'Computers', ja: 'コンピューター', ko: '컴퓨터', zh: '电脑', hi: 'कंप्यूटर' }, icon: ComputerIcon },
  { id: 'games', names: { th: 'เกม', en: 'Games', ja: 'ゲーム', ko: '게임', zh: '游戏', hi: 'गेम्स' }, icon: SportsEsportsIcon },
  { id: 'card_games', names: { th: 'การ์ดเกม', en: 'Card Games', ja: 'カードゲーム', ko: '카드 게임', zh: '卡牌游戏', hi: 'कार्ड गेम्स' }, icon: StyleIcon },
  { id: 'toys', names: { th: 'ของเล่น', en: 'Toys', ja: 'おもちゃ', ko: '장난감', zh: '玩具', hi: 'खिलौने' }, icon: ToysIcon },
  { id: 'mom_baby', names: { th: 'แม่และเด็ก', en: 'Mom & Baby', ja: 'ママ＆ベビー', ko: '엄마와 아기', zh: '母婴用品', hi: 'माँ और शिशु' }, icon: ChildFriendlyIcon },
  { id: 'furniture', names: { th: 'เฟอร์นิเจอร์', en: 'Furniture', ja: '家具', ko: '가구', zh: '家具', hi: 'फर्नीचर' }, icon: ChairIcon },
  { id: 'home_decor', names: { th: 'ของแต่งบ้าน', en: 'Home Decor', ja: '室内装飾', ko: '집 꾸미기', zh: '家居装饰', hi: 'घर की सजावट' }, icon: DeckIcon },
  { id: 'otop', names: { th: 'OTOP', en: 'OTOP', ja: 'OTOP', ko: 'OTOP', zh: '一村一品', hi: 'ओटीओपी' }, icon: StorefrontIcon },
  { id: 'snacks', names: { th: 'ขนม', en: 'Snacks', ja: 'スナック', ko: '과자', zh: '零食', hi: 'स्नैक्स' }, icon: BakeryDiningIcon },
  { id: 'food', names: { th: 'อาหาร', en: 'Food', ja: '食品', ko: '음식', zh: '食品', hi: 'खाना' }, icon: FastfoodIcon },
  { id: 'health', names: { th: 'สุขภาพ', en: 'Health', ja: '健康', ko: '건강', zh: '健康', hi: 'स्वास्थ्य' }, icon: MonitorHeartIcon },
  { id: 'beauty', names: { th: 'ความงาม', en: 'Beauty', ja: '美容', ko: '뷰티', zh: '美容', hi: 'सौंदर्य' }, icon: AutoFixHighIcon },
  { id: 'pets', names: { th: 'สัตว์เลี้ยง', en: 'Pets', ja: 'ペット', ko: '반려동물', zh: '宠物', hi: 'पालतू जानवर' }, icon: PetsIcon },
  { id: 'books', names: { th: 'หนังสือและเครื่องเขียน', en: 'Books & Stationery', ja: '書籍・文房具', ko: '도서 및 문구', zh: '图书文具', hi: 'किताबें और स्टेशनरी' }, icon: MenuBookIcon },
  { id: 'fashion', names: { th: 'แฟชั่น', en: 'Fashion', ja: 'ファッション', ko: '패션', zh: '时尚', hi: 'फैशन' }, icon: CheckroomIcon, subCategories: [
    { id: 'womens_clothing', names: { th: 'เสื้อผ้าผู้หญิง', en: 'Women\'s Clothing', ja: '婦人服', ko: '여성 의류', zh: '女装', hi: 'महिलाओं के कपड़े' } },
    { id: 'mens_clothing', names: { th: 'เสื้อผ้าผู้ชาย', en: 'Men\'s Clothing', ja: '紳士服', ko: '남성 의류', zh: '男装', hi: 'पुरुषों के कपड़े' } },
  ]},
  { id: 'services', names: { th: 'บริการ & ฟรีแลนซ์', en: 'Services & Freelance', ja: 'サービス＆フリーランス', ko: '서비스 및 프리랜서', zh: '服务与自由职业', hi: 'सेवाएं और फ्रीलांस' }, icon: DesignServicesIcon },
  { id: 'digital', names: { th: 'สินค้าดิจิทัล', en: 'Digital Goods', ja: 'デジタルグッズ', ko: '디지털 상품', zh: '数字商品', hi: 'डिजिटल सामान' }, icon: CodeIcon },
  { id: 'appliances', names: { th: 'เครื่องใช้ไฟฟ้า', en: 'Appliances', ja: '家電製品', ko: '가전제품', zh: '家用电器', hi: 'उपकरण' }, icon: ElectricalServicesIcon },
  { id: 'hobbies', names: { th: 'งานอดิเรก', en: 'Hobbies', ja: '趣味', ko: '취미', zh: '爱好', hi: 'शौक' }, icon: SportsIcon },
  { id: 'charity', names: { th: 'การกุศลและบริจาค', en: 'Charity & Donations', ja: '慈善・寄付', ko: '자선 및 기부', zh: '慈善与捐赠', hi: 'दान और दान' }, icon: VolunteerActivismIcon },
];
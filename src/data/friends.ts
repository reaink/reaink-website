export interface FriendLink {
  name: string;
  href: string;
  avatar?: string;
  bio?: string;
  status?: boolean;
}

const fillAvatar = "https://1.gravatar.com/avatar/d41d8cd98f00b204e9800998ecf8427e?s=80&d=mm&r=x";

export const friendsList: FriendLink[] = [
  {
    name: "Ryan4Yin's Space",
    avatar: "https://thiscute.world/avatar/myself.webp",
    href: "https://thiscute.world",
    bio: "赞美快乐~",
    status: true,
  },
  {
    name: "Yutent Bash Blog",
    avatar: fillAvatar,
    href: "https://yutent.top",
    bio: "那些年的记忆",
    status: false,
  },
  {
    name: "Jdragon",
    avatar: "https://jdragon.club/upload/2019/7/timg-94aa8d5435584189995800b6d2743349.jpg",
    href: "https://jdragon.club",
    bio: "Hello world!",
    status: true,
  },
  {
    name: "椎咲良田",
    avatar: fillAvatar,
    href: "https://sanshiliuxiao.top",
    bio: "快走吧 趁风停止之前",
    status: false,
  },
  {
    name: "StarryFK 个人博客",
    avatar: "https://www.starryfk.com/usr/uploads/head.png",
    href: "https://www.starryfk.com",
    bio: "快走吧 趁风停止之前",
    status: true,
  },
  {
    name: "小坤哥哥博客",
    avatar: "https://whk.red/wp-content/uploads/2021/11/logo%E5%A4%9C.png",
    href: "https://whk.red",
    bio: "快走吧 趁风停止之前",
    status: true,
  },
  {
    name: "真的二嘉",
    avatar: "https://52dreamsky.cn/logo.png",
    href: "https://www.52dreamsky.cn",
    bio: "让我的努力，配得上明天的梦想！",
    status: true,
  },
  {
    name: "xingaqr",
    avatar: fillAvatar,
    href: "https://www.xingaqr.com/",
    bio: "",
    status: false,
  },
  {
    name: "震邦笔记",
    avatar: fillAvatar,
    href: "https://i-lab.top",
    bio: "",
    status: false,
  },
  {
    name: "澈丹大叔",
    avatar: "https://marx.run/images/R-C_1650201697744.jpg",
    href: "https://marx.run/",
    bio: "不积跬步，无以至千里。不积小流，无以成江海",
    status: true,
  },
  {
    name: "单单",
    avatar: "https://noif.cc/avatar.webp",
    href: "https://noif.cc/",
    bio: "人生没有如果，只有后果和结果。",
    status: true,
  },
  {
    name: "酥梨笔记",
    avatar: "https://zodensu.github.io/avatar.jpg",
    href: "https://zodensu.github.io/",
    bio: "A schön soul of this word.",
    status: true,
  },
  {
    name: "顾恒生",
    avatar: "https://xlboy.cn/service/tx.png",
    href: "https://xlboy.cn/",
    bio: "红尘道?道向何方",
    status: false,
  },
];

export const activeFriends = friendsList.filter((friend) => friend.status !== false);
export const inactiveFriends = friendsList.filter((friend) => friend.status === false);
'use client';
import React from 'react';
import { Box, Paper, Avatar, Typography } from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { useLanguage } from './LanguageProvider';

const DemoChat = () => {
    const { locale } = useLanguage();
    const manAvatar = "https://firebasestorage.googleapis.com/v0/b/studio-4973053271-10a9d.firebasestorage.app/o/Man%20Chat%20Demo.png?alt=media&token=3b6c65a1-a85b-456a-9ac1-93ae161dbb57";
    const womanAvatar = "https://firebasestorage.googleapis.com/v0/b/studio-4973053271-10a9d.firebasestorage.app/o/Women%20Chat%20Demo.png?alt=media&token=fded98fb-e4d2-4920-8e16-338102000ef5";

    const sentences: { [key: string]: { [key: string]: string } } = {
        q1: { en: 'Is this item still available?', th: 'สินค้านี้ยังมีอยู่ไหมครับ?', zh: '这个还有吗？', ja: 'この商品はまだありますか？', ko: '이 상품 아직 있나요?', hi: 'क्या यह आइटम अभी भी उपलब्ध है?' },
        a1: { en: 'Yes! Still available.', th: 'ใช่ค่ะ ยังขายอยู่ค่ะ', zh: '是的，仍然可用', ja: 'はい、まだ利用可能です', ko: '네, 아직 구매 가능합니다', hi: 'हाँ! अभी भी उपलब्ध है।' },
        q2: { en: 'Can I see more pictures? What is the condition like?', th: 'ขอดูรูปเพิ่มเติมได้ไหมครับ สภาพเป็นอย่างไรบ้าง', zh: '可以多看几张照片吗？情况怎么样？', ja: 'もっと写真を見せてもらえますか？状態はどうですか？', ko: '사진을 더 볼 수 있을까요? 상태는 어떤가요?', hi: 'क्या मुझे और तस्वीरें मिल सकती हैं? इसकी हालत कैसी है?' },
        a2: { en: 'Condition is great, like new! I will send more photos.', th: 'สภาพดีมากค่ะ เหมือนใหม่เลย เดี๋ยวส่งรูปให้ดูนะคะ', zh: '状况很好，像新的一样！我稍后会发送更多照片。', ja: '状態は新品同様です！後でもっと写真を送ります。', ko: '상태는 새것처럼 아주 좋습니다! 사진을 더 보내드리겠습니다。', hi: 'हालत बहुत अच्छी है, बिल्कुल नई जैसी! मैं और तस्वीरें भेजूंगा।' }
    };

    const safeLocale = (Object.keys(sentences.q1).includes(locale)) ? locale : 'en';

    const MessageBubble = ({ text, translation, avatar, isMe }: { text: string, translation: string, avatar: string, isMe: boolean }) => (
        <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2, justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
            {!isMe && <Avatar src={avatar} sx={{ mr: 1.5 }} />}
            <Paper elevation={0} sx={{ p: 1.5, borderRadius: '12px', bgcolor: isMe ? 'primary.main' : 'background.paper', color: isMe ? '#fff' : 'text.primary', maxWidth: '80%' }}>
                <Typography variant="body1">{text}</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, opacity: 0.8 }}>
                    <AutoAwesomeIcon sx={{ fontSize: '1rem', mr: 0.5 }} />
                    <Typography variant="caption">
                        AI: {translation}
                    </Typography>
                </Box>
            </Paper>
            {isMe && <Avatar src={avatar} sx={{ ml: 1.5 }} />}
        </Box>
    );

    return (
        <Paper elevation={6} sx={{ p: 3, borderRadius: '16px', maxWidth: 450, mx: 'auto' }}>
            <MessageBubble 
                text={sentences.q1[safeLocale]}
                translation={sentences.q1['en']}
                avatar={manAvatar}
                isMe={false}
            />
            <MessageBubble 
                text={sentences.a1['en']}
                translation={sentences.a1[safeLocale]}
                avatar={womanAvatar}
                isMe={true}
            />
            <MessageBubble 
                text={sentences.q2[safeLocale]}
                translation={sentences.q2['en']}
                avatar={manAvatar}
                isMe={false}
            />
            <MessageBubble 
                text={sentences.a2['en']}
                translation={sentences.a2[safeLocale]}
                avatar={womanAvatar}
                isMe={true}
            />
        </Paper>
    );
};

export default DemoChat;

# FalconPro - متجر المكملات الغذائية

## نظرة عامة

متجر إلكتروني احترافي متكامل لبيع المكملات الغذائية والبروتين، مبني بـ:
- **Next.js 15** + TypeScript
- **Tailwind CSS** + Framer Motion (حركات سلسة)
- **MongoDB** + Mongoose
- **next-intl** (عربي / إنجليزي)
- **JWT** للمصادقة

## الميزات الرئيسية

### للزبائن
- ✅ واجهة رئيسية أنيقة مع فيديو خلفية للجيم ورسائل تحفيزية
- ✅ تصنيف المنتجات إلى 3 أقسام رئيسية + أقسام فرعية
- ✅ سلة مشتريات كاملة مع كود خصم
- ✅ إتمام طلب بسيط (رقم هاتف + محافظة + عنوان)
- ✅ طلب بدون تسجيل دخول
- ✅ تسجيل دخول / إنشاء حساب بسيط (رقم هاتف + باسورد 4 أحرف)
- ✅ صفحة الملف الشخصي + الطلبات السابقة
- ✅ **كرت الولاء**: كل 5 طلبات = هدية مجانية
- ✅ تصميم 100% متجاوب مع الهاتف

### لوحة التحكم (Admin)
- ✅ `/admin/login` - تسجيل دخول منفصل للمسؤول
- ✅ إحصائيات ولوحة تحكم
- ✅ إدارة المنتجات (إضافة، تعديل، حذف)
- ✅ إدارة الأقسام (رئيسية + فرعية)
- ✅ إدارة الطلبات + تغيير الحالة
- ✅ أكواد الخصم
- ✅ إعدادات المتجر (تعديل عدد الطلبات للولاء، وضع الصيانة)

## تشغيل المشروع محلياً

```bash
npm install
npm run dev
```

افتح المتصفح على: `http://localhost:3000/ar`

## بيانات افتراضية (Seed)

لإضافة بيانات تجريبية (منتجات، أقسام، أدمن):

```bash
curl -X POST http://localhost:3000/api/seed
```

أو افتح الرابط في المتصفح:
`http://localhost:3000/api/seed`

## بيانات دخول الأدمن

بعد تشغيل `seed`:
- **رقم الهاتف**: `07701234567`
- **كلمة المرور**: `1234`

رابط لوحة التحكم: `http://localhost:3000/admin`

## البيئة (Environment Variables)

أنشئ ملف `.env.local`:

```env
MONGODB_URI=mongodb://localhost:27017/falconpro
JWT_SECRET=your-secret-key-here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## النشر (Hostinger)

1. بناء المشروع:
```bash
npm run build
```

2. رفع الملفات على Hostinger (Node.js hosting)

3. ضبط متغيرات البيئة في لوحة تحكم Hostinger

4. تشغيل:
```bash
npm start
```

## ملاحظات مهمة

- **قاعدة البيانات**: يجب توفير MongoDB (محلي أو MongoDB Atlas)
- **الصور**: المنتجات التجريبية تستخدم صور من Unsplash
- **الفيديو**: الخلفية الرئيسية تستخدم فيديو مجاني من Mixkit
- **الدفع**: حالياً "الدفع عند الاستلام" فقط

## التقنية

| المكون | التقنية |
|--------|---------|
| Frontend | Next.js 15 App Router |
| Styling | Tailwind CSS + Custom Colors |
| Animations | Framer Motion |
| Backend | Next.js API Routes |
| Database | MongoDB + Mongoose |
| Auth | JWT (Custom) |
| i18n | next-intl |
| Icons | Lucide React |

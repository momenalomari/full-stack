// الطريقة الأفضل: دالة تستقبل الـ schema وتُرجع الميدلوير
export const validateRegister = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, { abortEarly: false });

    if (error) {
      return res.status(400).json({
        message: "Validation Error",
        errors: error.details.map((err) => err.message),
      });
    }

    req.body = value; // إسناد البيانات بعد التنظيف
    next();
  };
};

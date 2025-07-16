// Generate tracking number (example: SHX-20230615-12345)
const generateTrackingNumber = () => {
  const date = new Date();
  const dateStr = date.toISOString().split('T')[0].replace(/-/g, '');
  const randomNum = Math.floor(10000 + Math.random() * 90000);
  return `SHX-${dateStr}-${randomNum}`;
};

module.exports = {
  generateTrackingNumber
};
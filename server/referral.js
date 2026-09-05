const User = require('./models/User');
const Transaction = require('./models/Transaction');

async function distributeReferralCommissions(childUser, childProfit) {
  const rates = { levelA: 0.05, levelB: 0.03, levelC: 0.01 };

  if (childUser.parentA) {
    let parentA = await User.findById(childUser.parentA);
    if (parentA && parentA.vipLevel >= 1) {
      let comm = childProfit * rates.levelA;
      parentA.balance = (parentA.balance || 0) + comm;
      parentA.referralEarnings = (parentA.referralEarnings || 0) + comm;
      await parentA.save();
      const tx = new Transaction({ userId: parentA._id, userName: parentA.fullName, phone: parentA.phone, type: 'commission', amount: comm, network: 'SYSTEM', status: 'approved', note: `عمولة فئة A من ${childUser.phone}` });
      await tx.save();
    }
  }
  if (childUser.parentB) {
    let parentB = await User.findById(childUser.parentB);
    if (parentB && parentB.vipLevel >= 1) {
      let comm = childProfit * rates.levelB;
      parentB.balance = (parentB.balance || 0) + comm;
      parentB.referralEarnings = (parentB.referralEarnings || 0) + comm;
      await parentB.save();
      const tx = new Transaction({ userId: parentB._id, userName: parentB.fullName, phone: parentB.phone, type: 'commission', amount: comm, network: 'SYSTEM', status: 'approved', note: `عمولة فئة B من ${childUser.phone}` });
      await tx.save();
    }
  }
  if (childUser.parentC) {
    let parentC = await User.findById(childUser.parentC);
    if (parentC && parentC.vipLevel >= 1) {
      let comm = childProfit * rates.levelC;
      parentC.balance = (parentC.balance || 0) + comm;
      parentC.referralEarnings = (parentC.referralEarnings || 0) + comm;
      await parentC.save();
      const tx = new Transaction({ userId: parentC._id, userName: parentC.fullName, phone: parentC.phone, type: 'commission', amount: comm, network: 'SYSTEM', status: 'approved', note: `عمولة فئة C من ${childUser.phone}` });
      await tx.save();
    }
  }
}
module.exports = { distributeReferralCommissions };

async function distributeReferralCommissions(childUser, childProfit) {
  const rates = { levelA: 0.05, levelB: 0.03, levelC: 0.01 }; // 5%, 3%, 1%

  // الفئة A (المباشر)
  if (childUser.parentA) {
    let parentA = await User.findById(childUser.parentA);
    if (parentA && parentA.vipLevel >= 1) {
      let comm = childProfit * rates.levelA;
      parentA.balance += comm;
      parentA.referralEarnings += comm;
      await parentA.save();
      await LogTransaction(parentA._id, comm, `Passive Income Class A from ${childUser.phone}`);
    }
  }

  // الفئة B
  if (childUser.parentB) {
    let parentB = await User.findById(childUser.parentB);
    if (parentB && parentB.vipLevel >= 1) {
      let comm = childProfit * rates.levelB;
      parentB.balance += comm;
      parentB.referralEarnings += comm;
      await parentB.save();
      await LogTransaction(parentB._id, comm, `Passive Income Class B from ${childUser.phone}`);
    }
  }

  // الفئة C
  if (childUser.parentC) {
    let parentC = await User.findById(childUser.parentC);
    if (parentC && parentC.vipLevel >= 1) {
      let comm = childProfit * rates.levelC;
      parentC.balance += comm;
      parentC.referralEarnings += comm;
      await parentC.save();
      await LogTransaction(parentC._id, comm, `Passive Income Class C from ${childUser.phone}`);
    }
  }
}

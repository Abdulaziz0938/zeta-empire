// يعمل كل 30 يوم للتحقق من أسر الفريق ودفع الرواتب
cron.schedule('0 0 */30 * *', async () => {
  const leaders = await User.find({ vipLevel: { $gte: 5 } });

  for (let leader of leaders) {
    let teamCount = await getDirectTeamCount(leader._id);
    let salary = 0;

    if (teamCount >= 50) salary = 100;
    else if (teamCount >= 30) salary = 60;
    else if (teamCount >= 10) salary = 20;

    if (salary > 0) {
      leader.balance += salary;
      await leader.save();
      await LogTransaction(leader._id, salary, "Monthly Team Leader Salary");
    }
  }
});

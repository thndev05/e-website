
module.exports.index = (req, res) => {
  res.render('client/home/index', {
    title: 'Home',
    isHome: true,
  })
}
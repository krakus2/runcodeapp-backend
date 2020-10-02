const RUNCODE_ACCESS_TOKEN_KEY = 'X-RunCode-Access'
const RUNCODE_ACCESS_TOKEN_VALUE = 'RUNCODE'

module.exports = (req, res, next) => {
  try {
    const token = req.header(RUNCODE_ACCESS_TOKEN_KEY)

    if (token !== RUNCODE_ACCESS_TOKEN_VALUE) {
      throw 'Invalid token'
    } else {
      next()
    }
  } catch {
    res.status(401).json({
      error: new Error('Invalid request'),
    })
  }
}

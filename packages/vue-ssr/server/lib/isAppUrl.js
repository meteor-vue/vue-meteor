import { RoutePolicy } from 'meteor/routepolicy'

const nonAppUrls = ['/favicon.ico', '/robots.txt', '/app.manifest']

export default (req) => {
  const url = req.url

  if (nonAppUrls.includes(url)) {
    return false
  }

  // Avoid serving app HTML for declared routes such as /sockjs/.
  return !RoutePolicy.classify(url)
}

// boot
import { OpenAudioMc } from '../../OpenAudioMc'
import ClientTokenSet from '../libs/ClientTokenSet'
import { fetch } from '../../../libs/github.fetch'
import { ReportError } from '../protocol/ErrorReporter'
import { API_ENDPOINT } from '../protocol/ApiEndpoints'
import { strictlyShowCard, UiCards } from '../../modules/ui/UserInterfaceModule'

let openAudioMc = null

export default openAudioMc

function enable() {
  if (openAudioMc.canStart) {
    openAudioMc.start()
  }
}

export function linkBootListeners() {
  // purge old clients
  if (document.getElementsByTagName("v6").length > 0) {
    window.location.href = 'https://mindgamesnl.github.io/OpenAudioMc/old_client.html'
    return
  }

  const isSafari = navigator.vendor && navigator.vendor.indexOf('Apple') > -1 &&
    navigator.userAgent &&
    navigator.userAgent.indexOf('CriOS') == -1 &&
    navigator.userAgent.indexOf('FxiOS') == -1

  if (isSafari) {
    window.location.href = 'https://mindgamesnl.github.io/OpenAudioMc/browsers.html'
    return
  }

  let sessionLoader = new ClientTokenSet()
  sessionLoader.initialize()
    .then(tokenSet => {
      console.log(tokenSet)
      if (tokenSet == null) {
        strictlyShowCard(UiCards.BAD_AUTH)
        ReportError('A faulty login attempt was done at ' + window.location.host, 'Steve')
        return
      }

      // can we find a name? let's put it as a welcome text!
      // makes the experience a bit more personal
      if (tokenSet != null && tokenSet.name != null) {
        document.getElementById('top-head').src = 'https://minotar.net/helm/' + tokenSet.name
        document.getElementById('in-game-name').innerText = tokenSet.name
        openAudioMc = new OpenAudioMc()
      }

      document.body.addEventListener('click', enable)

      // check server status
      fetch(API_ENDPOINT.SERVER_STATUS + tokenSet.name).then(r => {
        r.json().then(response => {
          if (response.offline) {
            console.log('Redirecting because network error')
            window.location.href = 'https://mindgamesnl.github.io/OpenAudioMc/network_error.html'
          } else {
            console.log('[OpenAudioMc] Server status:' + JSON.stringify(response))
          }
        })
      })
    })
    .catch(error => {
      // check server status
      console.log(error)
      window.location.href = 'https://mindgamesnl.github.io/OpenAudioMc/network_error.html'
    })

}

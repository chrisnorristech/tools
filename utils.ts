import publicIP from 'react-native-public-ip'
import { ReadFastPasses, ReadSheetData } from 'functions/handleAsyncStorage'

/**
 * trim - truncates a floating point number to [precision] decimal points
 * @param number - number to trim
 * @param precision - how many decimal places
 * @return truncated value
 *
 * 2020/10/20: CDN - initial development
 **/
export const trim = (number, precision) => {
  const array = number.toString().split('.')
  array.push(array.pop().substring(0, precision))
  const trimmedNumber = array.join('.')
  return trimmedNumber
}

/**
 * findWagerType - locate wager by wagerType
 * @param wagerType - type of wager
 * @return wager element object
 *
 * 2020/10/20: CDN - initial development
 **/
export const findWagerType = (wagerType, oddsJson) => {
  let wagerElement = {}
  oddsJson.wagerTypes.forEach(element => {
    if (element.oddsType === wagerType) {
      wagerElement = element
    }
  })
  return wagerElement
}

/**
 * findOdds - locate odds element by numBets
 * @param wagerElement - what to search
 * @param numBets - number of bets in the array
 * @return odds element
 *
 * 2020/10/20: CDN - initial development
 **/
export const findOdds = (wagerElement, numBets) => {
  let oddsElement = {}
  wagerElement.wagerOdds.forEach(element => {
    if (element.wagerCount === numBets) {
      oddsElement = element
    }
  })
  return oddsElement
}

/**
 * parseDateTimeString - parses string in format "YYYY-MM-DDTHH:MM:SS"
 * @param strDateTime - date time string to parse
 * @return datetime as Date object
 *
 *  2020/10/21: CDN - initial development
**/
export const parseDateTimeString = strDateTime => {
  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ]
  const year = strDateTime.substring(0, 4)
  const month = strDateTime.substring(5, 7)
  const day = strDateTime.substring(8, 10)
  const hour = strDateTime.substring(11, 13)
  const minutes = strDateTime.substring(14, 16)
  const seconds = strDateTime.substring(17, 19)
  const strParsed = `
    ${monthNames[parseInt(month) - 1]} ${day}, ${year} ${hour}:${minutes}:${seconds}`
  const parsedDate = new Date(strParsed)
  return parsedDate
}

/**
 * parseDateTimeToISOString - converts date time string to ISO date
 * @param strDateTime - date time string
 * @returns ISO date string
 *
 * 2020/10/21: CDN - initial development
 */
export const parseDateTimeToISOString = strDateTime => {
  const year = strDateTime.substring(0, 4)
  const month = strDateTime.substring(5, 7)
  const day = strDateTime.substring(8, 10)
  const hour = strDateTime.substring(11, 13)
  const minutes = strDateTime.substring(14, 16)
  const seconds = strDateTime.substring(17, 19)
  const strParsed = `
    ${year}/${month}/${day}T${hour}:${minutes}:${seconds}`
  const parsedDate = new Date(strParsed)
  return parsedDate
}

/**
 *  custom_date_sort - sorts dates in array decending
 *  @param a - current item object
 *  @param b - previous item object
 * @returns sorted array
 *
 * 2020/10/20: CDN - initial development
 **/
export const customDateSort = (a, b) => {
  return new Date(a.Time).getTime() < new Date(b.Time).getTime()
}

/**
 * getPublicIP - returns public ip address of device
 * @returns public ip as string
 *
 * 2020/10/20: CDN - initial development
 */
export const getPublicIP = async () => {
  try {
    const ip = await publicIP()
    return ip
  } catch (error) {
    console.error(error)
    return null
  }
}

/**
 * findInJSON - locates object inside of JSON array
 * @param haystack - JSON array
 * @param needle - string to match against filter
 * @param filter - field to search by within JSON array
 * @returns filtered array of objects that match
 *
 * 2020/10/20: CDN - initial development
 */
export const findInJSON = (haystack, needle, filter) => {
  const filtered = haystack.filter((item) => { return item[filter] === needle })
  return filtered
}

/**
 * extractTimeDate - extracts time and date from Time Date String
 * @param timeDate - time date string to parse
 * @returns object containing time and date
 *
 * 2020/10/20: CDN - initial development
 */
export const extractTimeDate = timeDate => {
  const origDate = timeDate.split('T')[0]
  const arrDate = origDate.split('-')
  const year = arrDate[0]
  const month = arrDate[1]
  const day = arrDate[2]
  const time = timeDate.split('T')[1]
  const hour = time.split(':')[0]
  const minute = time.split(':')[1]
  const intHour = parseInt(hour)
  const suffix = intHour >= 12 ? 'pm' : 'am'
  const outHour = ((intHour + 11) % 12) + 1
  const outTime = `${outHour}:${minute} ${suffix}`
  return {
    date: `${month}/${day}/${year}`,
    time: outTime,
  }
}

/**
 * sortDate - sorts objects that contain GameTime by the GameTime
 * @param data - array of objects containing GameTime
 * @param direction - which direction to sort array
 * @returns sorted array
 *
 * 2020/10/20: CDN - initial development
 */
export const sortData = (data, direction) => {
  return data.$values.sort(function(a, b) {
    return direction === 'asc'
      ? new Date(b.GameTime).getTime() - new Date(a.GameTime).getTime()
      : new Date(b.GameTime).getTime() + new Date(a.GameTime).getTime()
  })
}

/**
 * breakArrayIntoGroups - breaks an array into groups of x number of objects
 * @param data - array to split
 * @param maxPerGroup - how many per group
 * @returns array of groups of objects
 *
 * 2020/10/20: CDN - initial development
 */
export const breakArrayIntoGroups = (data, maxPerGroup) => {
  const groups = []
  for (let index = 0; index < data.length; index += maxPerGroup) {
    groups.push(data.slice(index, index + maxPerGroup))
  }
  return groups
}

/**
  * currentFormat - converts number to currency
  * @param num number to convert
  * @returns currency formatted string
  *
  * 2020/10/20: CDN - initial development
  */
export const currencyFormat = num => {
  return '$' + num.toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
}

/**
 * getSheetInfoBySheetId - return array of sheet info objects based on sheetId
 * @param sheetId - sheetId to filter on
 * @returns array of objects matching sheetId
 *
 * 2020/10/20: CDN - initial development
 */

export const getSheetInfoBySheetId = async (sheetId: string) => {
  const wagers = []

  const sheetData = await ReadSheetData(sheetId)
  const games = sheetData.Games
  const sports = sheetData.sports
  const teams = sheetData.teams
  const odds = sheetData.odds
  const sheetType = games.$values[0].Selections.$values[0].Type.toLowerCase()

  games.$values.forEach(element => {
    if (element.SheetID === sheetId) {
      wagers.push(element)
    }
  })
  return {
    sheetType: sheetType,
    wagers: wagers,
    sports: sports,
    teams: teams,
    odds: odds,
    gameCount: games.$values.length,
    sheetId: sheetData.ID,
    sheetTitle: sheetData.Title,
    sheetSport: sheetData.Type
  }
}

/**
 * cleanArray - removes null and undefined objects from array
 * @param arrayToClean - array to clean
 * @returns cleaned array with no undefined or null objects
 *
 * 2020/10/20: CDN - initial development
 */
export const cleanArray = (arrayToClean) => {
  const cleanedArray = []
  if (arrayToClean && arrayToClean.length > 0) {
    arrayToClean.forEach(item => {
      if (item) {
        cleanedArray.push(item)
      }
    })
  }
  return cleanedArray
}

/**
  * syncAsyncStorageToState - copy async storage item to state
  * @param setFp reference to the setFp update state call
  * @returns nothing
  *
  * 2020/10/20: CDN - initial development
  */
export const syncAsyncStorageToState = setFp => {
  const fp = []
  ReadFastPasses()
    .then(data => {
      if (data.length > 0) {
        for (let i = 0; i < data.length; i++) {
          const element = data[i]
          fp.push(JSON.parse(element[1]))
        }
      }
      setFp(fp)
    })
    .catch(error => {
      console.log('error:' + error)
    })
}

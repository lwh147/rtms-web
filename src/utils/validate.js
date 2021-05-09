/**
 * Created by PanJiaChen on 16/11/18.
 */

/**
 * @param {string} path
 * @returns {Boolean}
 */
export function isExternal(path) {
  return /^(https?:|mailto:|tel:)/.test(path)
}

/**
 * @param {string} str
 * @returns {Boolean}
 */
export function validUsername(str) {
  const regex = /^[\w.]{10}$/
  return regex.test(str)
}

/**
 * @param {string} str
 * @returns {Boolean}
 */
export function validPassword(str) {
  const regex = /^[\d]{6}$/
  return regex.test(str)
}

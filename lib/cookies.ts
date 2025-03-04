/**
 * Utilitaires pour la gestion des cookies
 */

/**
 * Récupère la valeur d'un cookie par son nom
 * @param name Le nom du cookie à récupérer
 * @returns La valeur du cookie ou null s'il n'existe pas
 */
export function getCookie(name: string): string | null {
  if (typeof document === 'undefined') {
    return null;
  }
  
  const cookies = document.cookie.split(';');
  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i].trim();
    // Le cookie commence-t-il par le nom que nous recherchons?
    if (cookie.substring(0, name.length + 1) === (name + '=')) {
      return decodeURIComponent(cookie.substring(name.length + 1));
    }
  }
  return null;
}

/**
 * Définit un cookie avec le nom et la valeur spécifiés
 * @param name Le nom du cookie
 * @param value La valeur du cookie
 * @param days Le nombre de jours avant expiration (optionnel)
 */
export function setCookie(name: string, value: string, days?: number): void {
  if (typeof document === 'undefined') {
    return;
  }
  
  let expires = '';
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    expires = '; expires=' + date.toUTCString();
  }
  
  document.cookie = name + '=' + encodeURIComponent(value) + expires + '; path=/';
}

/**
 * Supprime un cookie par son nom
 * @param name Le nom du cookie à supprimer
 */
export function deleteCookie(name: string): void {
  if (typeof document === 'undefined') {
    return;
  }
  
  setCookie(name, '', -1);
} 
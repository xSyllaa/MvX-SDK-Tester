/**
 * Ce module contient des fonctions pour cloner un dépôt Git vers un chemin local.
 */

import { CloneConfig } from '../types/parser';

const TIMEOUT: number = 60000; // 60 secondes en millisecondes

/**
 * Clone un dépôt vers un chemin local basé sur la configuration fournie.
 * 
 * Cette fonction gère le processus de clonage d'un dépôt Git vers le système de fichiers local.
 * Elle peut cloner une branche ou un commit spécifique si fourni, et lève des exceptions
 * si des erreurs se produisent pendant le processus de clonage.
 * 
 * @param config - La configuration pour cloner le dépôt
 * @returns Une promesse qui se résout avec les sorties stdout et stderr des commandes Git exécutées
 */
export async function cloneRepo(config: CloneConfig): Promise<[string, string]> {
  if (config.subpath && config.subpath !== '/') {
    return await partialCloneRepo(config);
  }

  return await fullCloneRepo(config);
}

/**
 * Clone un dépôt complet vers un chemin local.
 * 
 * @param config - La configuration pour cloner le dépôt
 * @returns Une promesse qui se résout avec les sorties stdout et stderr des commandes Git exécutées
 * @throws {Error} Si les paramètres 'url' ou 'localPath' sont manquants, ou si le dépôt n'est pas trouvé
 */
async function fullCloneRepo(config: CloneConfig): Promise<[string, string]> {
  // Extraire et valider les paramètres de requête
  const url: string = config.url;
  const localPath: string = config.localPath;
  const commit: string | undefined = config.commit;
  const branch: string | undefined = config.branch;

  if (!url) {
    throw new Error("Le paramètre 'url' est requis.");
  }

  if (!localPath) {
    throw new Error("Le paramètre 'localPath' est requis.");
  }

  // Vérifier si le dépôt existe
  if (!await checkRepoExists(url)) {
    throw new Error("Dépôt non trouvé, assurez-vous qu'il est public");
  }

  // Préparer la commande de clonage de base
  const cloneCmd = ["git", "clone", "--recurse-submodules"];

  if (commit) {
    // Scénario 1: Cloner et checkout un commit spécifique
    // Cloner le dépôt sans profondeur pour assurer l'historique complet pour le checkout
    const cloneCommitCmd = [...cloneCmd, "--single-branch", url, localPath];
    await runGitCommand(...cloneCommitCmd);

    // Checkout du commit spécifique
    const checkoutCmd = ["git", "-C", localPath, "checkout", commit];
    return await runGitCommand(...checkoutCmd);
  }

  if (branch && !["main", "master"].includes(branch.toLowerCase())) {
    // Scénario 2: Cloner une branche spécifique avec une profondeur limitée
    const branchCmd = [...cloneCmd, "--depth=1", "--single-branch", "--branch", branch, url, localPath];
    return await runGitCommand(...branchCmd);
  }

  // Scénario 3: Cloner la branche par défaut avec une profondeur limitée
  const defaultCmd = [...cloneCmd, "--depth=1", "--single-branch", url, localPath];
  return await runGitCommand(...defaultCmd);
}

/**
 * Effectue un clonage partiel d'un dépôt Git basé sur la configuration fournie.
 * 
 * @param config - La configuration pour cloner le dépôt
 * @returns Une promesse qui se résout avec les sorties stdout et stderr des commandes Git exécutées
 * @throws {Error} Si le paramètre 'repoName' est manquant
 */
async function partialCloneRepo(config: CloneConfig): Promise<[string, string]> {
  const partialCloneCmd = [
    "git",
    "clone",
    "--filter=blob:none",
    "--sparse",
    config.url,
    config.localPath,
  ];
  await runGitCommand(...partialCloneCmd);

  if (!config.repoName) {
    throw new Error("Le paramètre 'repoName' est requis.");
  }

  const sparseCheckoutCmd = [
    "git",
    "sparse-checkout",
    "set",
    (config.subpath || '/').replace(/^\//, ''),
  ];
  return await runGitCommand(...sparseCheckoutCmd, { cwd: config.localPath });
}

/**
 * Vérifie si un dépôt Git existe à l'URL fournie.
 * 
 * @param url - L'URL du dépôt Git à vérifier
 * @returns Une promesse qui se résout avec un booléen indiquant si le dépôt existe
 * @throws {Error} Si la commande curl renvoie un code de statut inattendu
 */
async function checkRepoExists(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    
    if (response.status === 200 || response.status === 301) {
      return true;
    }
    
    if (response.status === 404 || response.status === 302) {
      return false;
    }
    
    throw new Error(`Code de statut inattendu: ${response.status}`);
  } catch (error) {
    console.error("Erreur lors de la vérification du dépôt:", error);
    return false;
  }
}

/**
 * Récupère la liste des branches d'un dépôt Git distant.
 * 
 * @param url - L'URL du dépôt Git pour récupérer les branches
 * @returns Une promesse qui se résout avec une liste des noms de branches disponibles dans le dépôt distant
 */
export async function fetchRemoteBranchList(url: string): Promise<string[]> {
  const [stdout] = await runGitCommand("git", "ls-remote", "--heads", url);
  
  return stdout
    .split('\n')
    .filter(line => line.trim() && line.includes('refs/heads/'))
    .map(line => line.split('refs/heads/')[1]);
}

/**
 * Exécute une commande Git de manière asynchrone et capture sa sortie.
 * 
 * @param args - La commande Git et ses arguments à exécuter
 * @param options - Options supplémentaires comme le répertoire de travail
 * @returns Une promesse qui se résout avec un tuple contenant stdout et stderr de la commande Git
 * @throws {Error} Si Git n'est pas installé ou si la commande Git se termine avec un statut non nul
 */
async function runGitCommand(...args: string[]): Promise<[string, string]>;
async function runGitCommand(...args: string[]): Promise<[string, string]> {
  // Dans un environnement navigateur, nous devons utiliser une approche différente
  // Cette implémentation est un placeholder - dans un vrai environnement navigateur,
  // vous devrez probablement utiliser une API ou un service backend
  
  console.log("Exécution de la commande Git:", args.join(' '));
  
  // Simulation d'une exécution de commande Git
  // Dans un vrai environnement, cela serait remplacé par un appel à une API backend
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Simuler une réponse réussie
      resolve(["Opération simulée réussie", ""]);
    }, 500);
  });
}

/**
 * Applique un timeout à une promesse.
 * 
 * @param promise - La promesse à laquelle appliquer le timeout
 * @param ms - Le délai en millisecondes avant le timeout
 * @returns Une promesse qui se résout avec le résultat de la promesse originale ou rejette avec une erreur de timeout
 */
function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  const timeout = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(new Error(`Opération expirée après ${ms}ms`));
    }, ms);
  });

  return Promise.race([promise, timeout]);
} 
# API-ENTMINI

API-ENTMINI est un projet visant à simplifier l'accès aux informations cruciales pour les étudiants du campus Beaulieu à Rennes. Cette API fournit des fonctionnalités telles que l'accès au calendrier de l'étudiant, la recherche des salles libres et d'autres fonctionnalités liées à l'ENT (Espace Numérique de Travail) de l'université.

## Fonctionnalités

- **Calendrier de l'étudiant**: L'API permet d'accéder au calendrier de l'étudiant en se connectant à l'ENT du campus Beaulieu. Cela permet aux étudiants de consulter leurs emplois du temps directement depuis une application tierce.

- **Recherche de salles libres**: L'API offre également la possibilité de rechercher les salles libres sur le campus Beaulieu, facilitant ainsi la planification des réunions et des séances d'étude pour les étudiants.

## Installation

Pour installer et utiliser l'API-ENTMINI, suivez ces étapes :

1. Clonez ce dépôt GitHub sur votre machine locale :
```
git clone https://github.com/FlorianCliquet/API-EntMini.git
```

2. Accédez au répertoire du projet :
```
cd API-EntMini
```

3. Installez les dépendances nécessaires en utilisant npm ou yarn :
```
npm install
ou
yarn install
```

## Utilisation

Une fois que vous avez installé les dépendances, vous pouvez utiliser l'API-ENTMINI en suivant ces étapes :

1. Lancez le serveur de développement :
```
npm start
ou
yarn start
```

2. L'API sera accessible à l'adresse suivante : `http://localhost:3000`. Vous pouvez maintenant commencer à utiliser les différentes fonctionnalités de l'API en effectuant des requêtes HTTP appropriées.

## Notes sur le client React (pour le développement)

Le client React inclus dans ce dépôt est principalement destiné au débogage et à la démonstration des fonctionnalités de l'API. Il n'est pas destiné à être utilisé en production et peut nécessiter des modifications et des améliorations significatives avant d'être déployé.

## Contribution

Les contributions à l'API-ENTMINI sont les bienvenues ! Si vous souhaitez contribuer, veuillez suivre ces étapes :

1. Fork ce dépôt sur GitHub.

2. Créez une nouvelle branche pour votre fonctionnalité ou votre correction de bogue :
```
git checkout -b ma-nouvelle-fonctionnalite
```
3. Faites vos modifications et committez-les :
```git commit -am "Ajoute une nouvelle fonctionnalité géniale"```

4. Poussez vos modifications sur votre dépôt GitHub :
```git push origin ma-nouvelle-fonctionnalite```

5. Ouvrez une Pull Request pour que vos modifications soient examinées et fusionnées.

## Licence

Ce projet est sous licence MIT. Consultez le fichier [MIT](LICENSE) pour plus de détails.

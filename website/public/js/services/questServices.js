'use strict';

(function(){
  angular
    .module('habitrpg')
    .factory('Quests', questsFactory);

  questsFactory.$inject = [
    '$rootScope',
    '$q',
    'Content',
    'Groups',
    'User',
    'Analytics'
  ];

  function questsFactory($rootScope, $q, Content, Groups, User, Analytics) {

    var user = User.user;
    var party = Groups.party();

    function lockQuest(quest,ignoreLevel) {
      if (!ignoreLevel){
        if (quest.lvl && user.stats.lvl < quest.lvl) return true;
      }
      if (user.achievements.quests) return (quest.previous && !user.achievements.quests[quest.previous]);
      return (quest.previous);
    }

    function _preventQuestModal(quest) {
      if (!quest) {
        return 'No quest with that key found';
      }

      if (quest.previous && (!user.achievements.quests || (user.achievements.quests && !user.achievements.quests[quest.previous]))){
        alert(window.env.t('unlockByQuesting', {title: Content.quests[quest.previous].text()}));
        return 'unlockByQuesting';
      }

      if (quest.lvl > user.stats.lvl) {
        alert(window.env.t('mustLvlQuest', {level: quest.lvl}))
        return 'mustLvlQuest';
      }
    }

    function buyQuest(quest) {
      return $q(function(resolve, reject) {
        var item = Content.quests[quest];

        var preventQuestModal = _preventQuestModal(item);
        if (preventQuestModal) {
          return reject(preventQuestModal);
        }

        if (item.unlockCondition && item.unlockCondition.condition === 'party invite') {
          if (!confirm(window.env.t('mustInviteFriend'))) return reject('Did not want to invite friends');
          Groups.inviteOrStartParty(party)
          return reject('Invite or start party');
        }

        resolve(item);
      });
    }

    function questPopover(quest) {
      // The popover gets parsed as markdown (hence the double \n for line breaks
      var text = '';
      if(quest.boss) {
        text += '**' + window.env.t('bossHP') + ':** ' + quest.boss.hp + '\n\n';
        text += '**' + window.env.t('bossStrength') + ':** ' + quest.boss.str + '\n\n';
      } else if(quest.collect) {
        var count = 0;
        for (var key in quest.collect) {
          text += '**' + window.env.t('collect') + ':** ' + quest.collect[key].count + ' ' + quest.collect[key].text() + '\n\n';
        }
      }
      text += '---\n\n';
      text += '**' + window.env.t('rewards') + ':**\n\n';
      if(quest.drop.items) {
        for (var item in quest.drop.items) {
          text += quest.drop.items[item].text() + '\n\n';
        }
      }
      if(quest.drop.exp)
        text += quest.drop.exp + ' ' + window.env.t('experience') + '\n\n';
      if(quest.drop.gp)
        text += quest.drop.gp + ' ' + window.env.t('gold') + '\n\n';

      return text;
    }

    function showQuest(quest) {
      return $q(function(resolve, reject) {
        var item =  Content.quests[quest];

        var preventQuestModal = _preventQuestModal(item);
        if (preventQuestModal) {
          return reject(preventQuestModal);
        }

        resolve(item);
      });
    }

    function closeQuest(){
      $rootScope.selectedQuest = undefined;
    }

    function questInit(){
      Analytics.track({'hitType':'event','eventCategory':'behavior','eventAction':'quest','owner':true,'response':'accept','questName':$rootScope.selectedQuest.key});
      Analytics.updateUser({'partyID':party._id,'partySize':party.memberCount});
      party.$questAccept({key:$rootScope.selectedQuest.key}, function(){
        party.$get();
        $rootScope.$state.go('options.social.party');
      });
      closeQuest();
    }

    return {
      lockQuest: lockQuest,
      buyQuest: buyQuest,
      questPopover: questPopover,
      showQuest: showQuest,
      closeQuest: closeQuest,
      questInit: questInit
    }
  }
}());

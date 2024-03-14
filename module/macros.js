import * as torgchecks from "/systems/torgeternity/module/torgchecks.js";

/**
 *
 */
export class TorgeternityMacros {
  //#region common
  onRenderKeyEnter(html, func) {
    const picker = html[0];
    picker.addEventListener("keypress", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        func();
      }
    });
  }

  //#endregion
  /**
   *
   */
  async clearStatusEffects() {
    try {
      const tokens = canvas.tokens.controlled;
      if (!game.user.isGM) {
        throw new Error(game.i18n.localize("torgeternity.macros.commonMacroOnlyByGM"));
      } else if (tokens.length === 0) {
        throw new Error(game.i18n.localize("torgeternity.macros.commonMacroNoTokensSelected"));
      }

      let chatOutput = `<p>${game.i18n.localize("torgeternity.macros.clearStatusEffectsHeadline")}</p><ul>`;

      for (const token of tokens) {
        const effects = token.actor.statuses;

        for (const effect of effects) {
          switch (effect) {
            case "stymied":
            case "veryStymied":
            case "vulnerable":
            case "veryVulnerable":
              console.log("Found " + effect);
              const ef = CONFIG.statusEffects.find((e) => e.id === effect);
              console.log(ef);
              await token.toggleEffect(ef, { active: false });
              chatOutput += `<li>${game.i18n.localize("torgeternity.macros.clearStatusEffectsliftetFrom")} ${
                token.actor.name
              } ${game.i18n.localize("torgeternity.macros.clearStatusEffectsliftetStatusOf")} ${game.i18n.localize(
                "torgeternity.statusEffects." + effect
              )}</li>`;
              break;
            default:
              continue;
          }
        }
      }

      if (!chatOutput.includes("<li>")) {
        chatOutput = game.i18n.localize("torgeternity.macros.clearStatusEffectsNothingFound");
      } else {
        chatOutput += "</ul>";
      }

      ChatMessage.create({ content: chatOutput });
    } catch (e) {
      ui.notification.error(e.message);
    }
  }

  /**
   *
   */
  async applyFatigue() {
    const tokens = canvas.tokens.controlled;

    if (tokens.length === 0) {
      ui.notifications.error(game.i18n.localize("torgeternity.macros.commonMacroNoTokensSelected"));
      return;
    }
    let chatOutput = `<h2>${game.i18n.localize("torgeternity.sheetLabels.fatigue")}!</h2><p>${game.i18n.localize(
      "torgeternity.macros.fatigueMacroDealtDamage"
    )}</p><ul>`;
    for (const _target of tokens) {
      if (_target === undefined) {
        console.log("Token is not defined! Returning!");
        throw new Error("Exception, token is undefined");
      }
      console.log(_target);
      if (_target.actor.system.shock.value === _target.actor.system.shock.max) {
        chatOutput += `<li>${_target.actor.name} ${game.i18n.localize(
          "torgeternity.macros.fatigueMacroCharAlreadyKO"
        )}</li>`;
        continue;
      }

      const targetShockValue = _target.actor.system.shock.value;

      const shockIncrease = _target.actor.system.other.fatigue;

      let shockResult = targetShockValue + shockIncrease;

      if (shockResult > _target.actor.system.shock.max) {
        shockResult = parseInt(_target.actor.system.shock.max);
      }

      await _target.actor.update({ "system.shock.value": shockResult });
      console.log(
        `Successfully increased the shock for ${_target.document.name} for the amount of ${shockIncrease} to ${shockResult}.`
      );
      chatOutput += `<li>${_target.document.name}: ${shockIncrease} ${game.i18n.localize(
        "torgeternity.sheetLabels.shock"
      )}`;
      if (
        parseInt(_target.actor.system.shock.value) >= parseInt(_target.actor.system.shock.max) &&
        !_target.actor.statuses.find((d) => d === "unconscious")
      ) {
        const eff = CONFIG.statusEffects.find((e) => e.id === "unconscious");
        _target.toggleEffect(eff, { active: true, overlay: true });
        chatOutput += `<br><strong>${_target.document.name}${game.i18n.localize(
          "torgeternity.macros.fatigueMacroCharKO"
        )}</strong>`;
      }
      chatOutput += "</li>";
    }
    chatOutput += "</ul>";

    ChatMessage.create({ content: chatOutput });
  }
  // #region Revive Shock
  /**
   *
   */
  async reviveShock() {
    const windowContent = `
            <form style="margin-bottom: 1rem; display:grid; grid-template-rows: repeat(2,auto); grid-template-columns: repeat(2,auto); align-items: center; gap:6px;">
                <label for="inputValue">${game.i18n.localize("torgeternity.macros.reviveMacroWindowLabel1")}</label>
                <input type="number" min="1" step="1" name="inputValue" id="inputValue">
                <input style="grid-row: 2/3;grid-column: 2/3;" type="checkbox" name="wholeRevive"> <label for="wholeRevive" style="grid-row: 2/3; grid-column: 1/2">${game.i18n.localize(
                  "torgeternity.macros.reviveMacroWholeRevive"
                )}
            </form>
        `;

    new Dialog({
      title: game.i18n.localize("torgeternity.macros.reviveMacroChatHeadline"),
      content: windowContent,
      buttons: {
        buttonExecute: {
          label: game.i18n.localize("torgeternity.dialogWindow.buttons.execute"),
          callback: game.torgeternity.macros._processReviveShock,
        },
      },
    }).render(true);
  }

  /**
   *
   * @param html
   */
  async _processReviveShock(html) {
    try {
      const tokens = canvas.tokens.controlled;

      const formElement = html[0].querySelector("form");
      const formData = await new FormDataExtended(formElement);
      const bolWholeRevive = formData.object.wholeRevive;
      const reviveAmount = parseInt(formData.object.inputValue);

      if (tokens.length === 0) {
        throw new Error(game.i18n.localize("torgeternity.macros.commonMacroNoTokensSelected"));
      } else if (bolWholeRevive === false && isNaN(reviveAmount)) {
        throw new Error(game.i18n.localize("torgeternity.macros.reviveMacroError1"));
      }

      let chatOutput = `<h2>${game.i18n.localize(
        "torgeternity.macros.reviveMacroChatHeadline"
      )}</h2><p>${game.i18n.localize("torgeternity.macros.reviveMacroFirst")}<p><ul>`;

      for (const _target of tokens) {
        // Following block, if a token has a null-value in system.shock.value (happens, if a value is simply deleted by user to set it apperently to 0), set it to 0, but double check it!
        if (isNaN(_target.actor.system.shock.value)) {
          await _target.actor.update({ "system.shock.value": 0 });
        }
        const targetShockValue = parseInt(_target.actor.system.shock.value);
        if (isNaN(targetShockValue)) {
          throw new Error("Shock Value is NaN");
        }

        if (targetShockValue === 0) {
          chatOutput += `<li>${_target.actor.name} ${game.i18n.localize(
            "torgeternity.macros.reviveMacroAlreadyFull"
          )}</li>`;
          continue;
        }

        if (bolWholeRevive) {
          await _target.actor.update({ "system.shock.value": 0 });
          chatOutput += `<li>${_target.actor.name} ${game.i18n.localize("torgeternity.macros.reviveMacroCharRevived")}`;
        } else {
          const newShockValue = parseInt(targetShockValue) - reviveAmount;
          await _target.actor.update({ "system.shock.value": newShockValue });
          chatOutput += `<li>${_target.actor.name} ${game.i18n.localize(
            "torgeternity.macros.reviveMacroCharPartyRevived"
          )}${reviveAmount}`;
        }

        if (_target.actor.statuses.find((d) => d === "unconscious")) {
          const eff = CONFIG.statusEffects.find((e) => e.id === "unconscious");
          _target.toggleEffect(eff, { active: false, overlay: false });
          chatOutput += `<br>${game.i18n.localize("torgeternity.macros.reviveMacroCharDeKOed")} ${_target.actor.name}`;
        }
        chatOutput += "</li>";
      }
      chatOutput += "</ul>";

      ChatMessage.create({ content: chatOutput });
    } catch (e) {
      ui.notifications.error(e.message);
    }
  }
  // #endregion
  // #region Roll BDs
  /**
   *
   */
  async rollBDs() {
    function onRender(html) {
      const picker = html[0];
      picker.addEventListener("keypress", (event) => {
        if (event.key === "Enter") {
          event.preventDefault();
          _rollItBDs();
        }
      });
    }

    const windowContent = `
            <form style="margin-bottom: 1rem;display:flex;flex-direction:row;gap: 9px;align-items:center">
                <label for="inputValue">${game.i18n.localize("torgeternity.macros.bonusDieMacroContent")}</label>
                <input style="width:25%;" type="number" min="1" step="1" name="inputValue" id="inputValue">
            </form>
        `;

    new Dialog({
      title: game.i18n.localize("torgeternity.macros.bonusDieMacroTitle"),
      content: windowContent,
      buttons: {
        buttonRoll: {
          label: game.i18n.localize("torgeternity.sheetLabels.roll") + "!",
          callback: game.torgeternity.macros._rollItBDs,
        },
      },
      render: onRender,
    }).render(true);
  }

  /**
   *
   * @param html
   */
  async _rollItBDs(html) {
    try {
      const formElement = html[0].querySelector("form");
      const formData = new FormDataExtended(formElement);
      const diceAmount = parseInt(formData.object.inputValue);

      if (isNaN(diceAmount)) {
        ui.notifications.error(game.i18n.localize("torgeternity.macros.commonMacroNoValue"));
        return;
      }

      const diceroll = await new Roll(`${diceAmount}d6x6max5`).evaluate({ async: true });

      try {
        await game.dice3d.showForRoll(diceroll);
      } catch {} // if dice so nice is not active, this will be an exception, but with a void catch statement

      let chatOutput = `<p>${game.i18n.localize(
        "torgeternity.macros.bonusDieMacroResult1"
      )} ${diceAmount} ${game.i18n.localize("torgeternity.chatText.bonusDice")} ${game.i18n.localize(
        "torgeternity.macros.bonusDieMacroResult2"
      )} ${diceroll.total}.</p>`;

      const targetedTokens = Array.from(game.user.targets);
      console.log(targetedTokens);
      console.log(targetedTokens.length);
      if (targetedTokens.size === 0) {
        chatOutput += `<p>${game.i18n.localize("torgeternity.macros.bonusDieMacroNoTokenTargeted")}</p>`;
        console.log("No targets, creating chat Message, leaving Macro.");
        ChatMessage.create({ content: chatOutput });
        return;
      }
      chatOutput += `<ul>`;
      for (const token of targetedTokens) {
        const tokenDamage = torgchecks.torgDamage(diceroll.total, token.actor.system.other.toughness);
        if (tokenDamage.shocks > 0) {
          chatOutput += `<li>${game.i18n.localize("torgeternity.macros.bonusDieMacroResult3")} ${
            token.document.name
          } ${game.i18n.localize("torgeternity.macros.bonusDieMacroResult4")} ${tokenDamage.label}.</li>`;
        } else {
          chatOutput += `<li>${game.i18n.localize("torgeternity.macros.bonusDieMacroResult3")} ${
            token.document.name
          } ${game.i18n.localize("torgeternity.macros.bonusDieMacroResultNoDamage")}.</li>`;
        }
      }
      chatOutput += "</ul>";

      ChatMessage.create({ content: chatOutput });
    } catch (e) {
      ui.notifications.error(e.message);
    }
  }
  // #endregion
}

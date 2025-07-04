export default function initProseMirrorEditor() {

  Hooks.on("getProseMirrorMenuDropDowns", (menu, dropdowns) => {
    const wrapIn = foundry.prosemirror.commands.wrapIn;
    if (!("format" in dropdowns)) return;

    dropdowns.format.entries.push({
      action: "torgeternity",
      title: "Torg Eternity",
      children: [
        {
          action: "te-sidenote-left",
          title: "Sidenote (left)",
          node: menu.schema.nodes.section,
          attrs: { _preserve: { class: "sidenote left" } },
          priority: 1,
          cmd: () => menu._toggleBlock(menu.schema.nodes.section, wrapIn,
            { attrs: { _preserve: { class: "sidenote left" } } })
        },
        {
          action: "te-sidenote-right",
          title: "Sidenote (right)",
          node: menu.schema.nodes.section,
          attrs: { _preserve: { class: "sidenote right" } },
          priority: 1,
          cmd: () => menu._toggleBlock(menu.schema.nodes.section, wrapIn,
            { attrs: { _preserve: { class: "sidenote right" } } })
        },
        {
          action: "te-aysle-splotch",
          title: "Aysle splotch",
          node: menu.schema.nodes.div,
          attrs: { _preserve: { class: "splotch aysle" } },
          priority: 1,
          cmd: () => menu._toggleBlock(menu.schema.nodes.div, wrapIn,
            { attrs: { _preserve: { class: "splotch aysle" } } })
        },
        {
          action: "te-cyber-splotch",
          title: "Cyberpapacy splotch",
          node: menu.schema.nodes.div,
          attrs: { _preserve: { class: "splotch cyber" } },
          priority: 1,
          cmd: () => menu._toggleBlock(menu.schema.nodes.div, wrapIn,
            { attrs: { _preserve: { class: "splotch cyber" } } })
        },
        {
          action: "te-nile-splotch",
          title: "Nile Empire splotch",
          node: menu.schema.nodes.div,
          attrs: { _preserve: { class: "splotch nile" } },
          priority: 1,
          cmd: () => menu._toggleBlock(menu.schema.nodes.div, wrapIn,
            { attrs: { _preserve: { class: "splotch nile" } } })
        },
        {
          action: "te-aysle-splotch",
          title: "Orrorsh splotch",
          node: menu.schema.nodes.div,
          attrs: { _preserve: { class: "splotch or" } },
          priority: 1,
          cmd: () => menu._toggleBlock(menu.schema.nodes.div, wrapIn,
            { attrs: { _preserve: { class: "splotch or" } } })
        },
        {
          action: "te-panpa-splotch",
          title: "Pan-Pacifica splotch",
          node: menu.schema.nodes.div,
          attrs: { _preserve: { class: "splotch panpa" } },
          priority: 1,
          cmd: () => menu._toggleBlock(menu.schema.nodes.div, wrapIn,
            { attrs: { _preserve: { class: "splotch panpa" } } })
        },
        {
          action: "te-thark-splotch",
          title: "Tharkold splotch",
          node: menu.schema.nodes.div,
          attrs: { _preserve: { class: "splotch thark" } },
          priority: 1,
          cmd: () => menu._toggleBlock(menu.schema.nodes.div, wrapIn,
            { attrs: { _preserve: { class: "splotch thark" } } })
        },
        {
          action: "te-directive1",
          title: "directive (type 1)",
          node: menu.schema.nodes.div,
          attrs: { _preserve: { class: "directive1" } },
          priority: 1,
          cmd: () => menu._toggleBlock(menu.schema.nodes.div, wrapIn,
            { attrs: { _preserve: { class: "directive1" } } })
        },
        {
          action: "te-directive2",
          title: "directive (type 2)",
          node: menu.schema.nodes.div,
          attrs: { _preserve: { class: "directive2" } },
          priority: 1,
          cmd: () => menu._toggleBlock(menu.schema.nodes.div, wrapIn,
            { attrs: { _preserve: { class: "directive2" } } })
        },
      ],
    });
  });
}
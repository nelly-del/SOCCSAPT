function switchTab(id, btn) {

    document
        .querySelectorAll('.tab')
        .forEach(tab =>
            tab.classList.remove('active')
        );

    document
        .querySelectorAll('.tab-panel')
        .forEach(panel =>
            panel.classList.remove('active')
        );

    btn.classList.add('active');

    const panel =
        document.getElementById('panel-' + id);

    if(panel){
        panel.classList.add('active');
    }
}
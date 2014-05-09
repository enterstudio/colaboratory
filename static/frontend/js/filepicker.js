/**
 *
 * @fileoverview provides file picking capability
 *
 */

goog.provide('colab.filepicker');

/**
 * Public developer key. Used by picker.
 *
 * @see https://console.developers.google.com/\
 *   project/apps~colab-sandbox/apiui/credential
 * @type {string}
 * @const
 */
colab.filepicker.PUBLIC_DEVELOPER_KEY =
    'AIzaSyCoDfWuxLxqqLWfKVNqfHy7DIWudoPTeuk';

/**
 * Upon successful file selection calls callback with
 * @param {function(Object)} cb Object is an instance of
 * google.picker.Response
 */
colab.filepicker.selectFile = function(cb) {
  gapi.load('picker', function() {
    var view = new google.picker.DocsView();
    view.setMode(google.picker.DocsViewMode.LIST);
    // Default extension, user can change and search for any file he wants
    view.setQuery('ipynb');
    view.setIncludeFolders(true).setSelectFolderEnabled(false);
    view.setLabel('Everything');
    var samples = new google.picker.DocsView();
    samples.setMode(google.picker.DocsViewMode.LIST);
    // List sample notebooks
    samples.setParent('0B0T--Ij9EBKoY3J0Ri05cTZxRG8');
    samples.setLabel('Sample Notebooks');
    var byMe = new google.picker.DocsView();
    byMe.setOwnedByMe(true);
    byMe.setMode(google.picker.DocsViewMode.LIST);
    byMe.setIncludeFolders(true)
        .setSelectFolderEnabled(false);

    var mimeTypes = ('application/ipynb' +
        ',application/colab,application/ipy,' +
        'application/octet-stream,application/vnd');

    var recentlyPicked = new google.picker.View(
        google.picker.ViewId.RECENTLY_PICKED);
    recentlyPicked.setMimeTypes(mimeTypes);

    // List sample notebooks
    var upload = new google.picker.DocsUploadView();

    var picker = new google.picker.PickerBuilder()
        .addView(recentlyPicked)
        .addView(view)
        .addView(byMe)
        .addView(samples)
        .addView(upload)
        .setOAuthToken(gapi.auth.getToken().access_token)
        .setDeveloperKey(colab.filepicker.PUBLIC_DEVELOPER_KEY)
        .setSelectableMimeTypes(mimeTypes)
        .setCallback(cb);
    var dlg = picker.build();
    dlg.setVisible(true);
  });
};

/**
 * Upon successful file selection calls callback with
 * @param {function(Object)} cb Object is an instance of
 * google.picker.Response
 */
colab.filepicker.selectDir = function(cb) {
  gapi.load('picker', function() {
    var docsView = new google.picker.DocsView()
      .setIncludeFolders(true)
      .setMimeTypes('application/vnd.google-apps.folder')
      .setSelectFolderEnabled(true);


    var picker = new google.picker.PickerBuilder()
      .setOAuthToken(gapi.auth.getToken().access_token)
      .setDeveloperKey(colab.filepicker.PUBLIC_DEVELOPER_KEY)
      .addView(docsView)
      .setCallback(cb);
    var dlg = picker.build();
    dlg.setVisible(true);
  });
};

/**
 * Selects a file and reloads colab on success.
 */
colab.filepicker.selectFileAndReload = function() {
  /** @param {Object} ev is json with fields listed in
   * google.picker.Response
  */
  var cb = function(ev) {
    var response = google.picker.Response;

    if (ev[response.ACTION] != google.picker.Action.PICKED) return;

    var doc = ev[response.DOCUMENTS][0];
    if (!doc || doc.length) return;
    var fileId = doc[google.picker.Document.ID];
    var url = colab.params.getNotebookUrl({'fileId': fileId });
    // If we are on notebook page, do proper reloading
    if (colab.reload) {
      window.location.href = url;
      colab.reload();
    } else {
      // This will reload the page once we exit this function.
      window.location.href = url;
    }
  };
  colab.filepicker.selectFile(cb);
};
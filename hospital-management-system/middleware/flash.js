/**
 * Minimal session flash messages.
 *   req.flash("success", "Saved.")   -> shown once on the next rendered page
 *   res.locals.flash                  -> [{ type, message }, ...]
 */
function flash(req, res, next) {
  req.flash = (type, message) => {
    if (!req.session) return;
    req.session.flash = req.session.flash || [];
    req.session.flash.push({ type, message });
  };

  res.locals.flash = (req.session && req.session.flash) || [];
  if (req.session) delete req.session.flash;
  next();
}

module.exports = flash;

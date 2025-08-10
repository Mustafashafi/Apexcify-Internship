
    // Calculator logic
    (function(){
      const exprEl = document.getElementById('expression');
      const resEl = document.getElementById('result');
      const keys = document.querySelectorAll('.key');
      let expr = ''; // internal expression (uses JS operators * and /)
      let lastActionWasEval = false;

      // helpers
      function safeDisplayExpression(str){
        return str === '' ? '0' : str;
      }

      function sanitizeForEval(input){
        // Replace unicode × ÷ and minus signs if any
        let s = input.replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-');
        // Allow only digits, operators, parentheses, dot, spaces
        if(!/^[0-9+\-*/().\s]*$/.test(s)) throw new Error('Invalid characters');
        // Prevent sequences like "**", "*/", "//" (we'll let JS handle most, but we do a small cleanup)
        s = s.replace(/\s+/g,'');
        // Collapse repeated operators (keep last if user typed many)
        s = s.replace(/([+\-*/]){2,}/g, (m) => m[m.length-1]);
        return s;
      }

      function evaluateExpression(displayExpr){
        try{
          if(displayExpr.trim()==='') return '';
          const s = sanitizeForEval(displayExpr);
          // Disallow starting with * or / (except unary -)
          if(/^[*/]/.test(s)) return '';
          // Use Function to evaluate safely after sanitization
          // Note: we sanitised characters above to digits/operators/parens/dot only.
          const value = Function('"use strict";return (' + s + ')')();
          if(typeof value === 'number' && isFinite(value)){
            // Trim trailing .0 for integers
            return Number.isInteger(value) ? value.toString() : value.toString();
          } else {
            return '';
          }
        }catch(e){
          return '';
        }
      }

      function updateUI(){
        exprEl.textContent = safeDisplayExpression(expr);
        const preview = evaluateExpression(expr);
        resEl.textContent = preview === '' ? '—' : preview;
      }

      function appendValue(v){
        // If last action was eval and user types a digit, start fresh
        if(lastActionWasEval && /[0-9.]/.test(v)){
          expr = '';
          lastActionWasEval = false;
        }
        // prevent two dots in same number (rough approach)
        if(v === '.'){
          // find last token after non-digit
          const tokens = expr.split(/[^0-9.]/);
          const lastToken = tokens[tokens.length-1];
          if(lastToken.includes('.')) return;
        }
        // prevent consecutive binary operators (except '(' and ')')
        if(/[+\-*/]/.test(v)){
          if(expr === '' && v !== '-') return; // don't start with +*/ only allow unary -
          if(/[+\-*/]$/.test(expr)) {
            // replace last operator with the new one
            expr = expr.replace(/[+\-*/]$/, v);
            updateUI();
            return;
          }
        }
        expr += v;
        updateUI();
      }

      function clearAll(){
        expr = '';
        lastActionWasEval = false;
        updateUI();
      }

      function deleteLast(){
        if(expr.length>0){
          expr = expr.slice(0, -1);
          lastActionWasEval = false;
          updateUI();
        }
      }

      function doEquals(){
        const result = evaluateExpression(expr);
        if(result !== ''){
          expr = '' + result; // show result as new expression
          lastActionWasEval = true;
          updateUI();
        } else {
          // invalid — do nothing or flash
          resEl.textContent = 'Error';
          setTimeout(updateUI, 700);
        }
      }

      // Attach button handlers
      keys.forEach(k => {
        k.addEventListener('click', e => {
          const v = k.dataset.value;
          const action = k.dataset.action;
          if(action === 'clear') { clearAll(); return; }
          if(action === 'delete') { deleteLast(); return; }
          if(action === 'equals') { doEquals(); return; }
          if(v !== undefined) appendValue(v);
        });
      });

      // Keyboard support
      document.addEventListener('keydown', e => {
        // If user focused some input (none here) you'd normally ignore — fine for this app.
        const key = e.key;
        if((/^[0-9]$/).test(key)){ appendValue(key); e.preventDefault(); return; }
        if(key === '.') { appendValue('.'); e.preventDefault(); return; }
        if(key === '+' || key === '-' || key === '*' || key === '/'){ appendValue(key); e.preventDefault(); return; }
        if(key === 'Enter' || key === '='){ doEquals(); e.preventDefault(); return; }
        if(key === 'Backspace'){ deleteLast(); e.preventDefault(); return; }
        if(key === 'Escape'){ clearAll(); e.preventDefault(); return; }
        if(key === '(' || key === ')'){ appendValue(key); e.preventDefault(); return; }
      });

      // Initial UI
      updateUI();

      // Small accessibility: announce changes to result (optional)
      const observer = new MutationObserver(()=> {
        // keep aria-live updated already through container; no extra needed
      });
      observer.observe(resEl, { childList:true, characterData:true, subtree:true });
    })();
 
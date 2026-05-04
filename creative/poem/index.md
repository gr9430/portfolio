---
layout: default
title: A POEM is
---

<div id="poem-display">
  <p>A POEM is</p>
  <p id="line-provocation"></p>
  <p id="line-contribution"></p>
  <p id="line-declarative"></p>
</div>

<hr>

<div id="contribute-section">
  <label for="word-input">add a word to the poem</label><br><br>
  <input type="text" id="word-input" maxlength="40" placeholder="one word">
  <button id="submit-word">submit</button>
  <p id="confirmation" style="display:none;">your word has been sent.</p>
</div>

<hr>

**Navigation:**
← [Back to Creative CV](/creative/) | [Home](/)

<script>
const provocation = ['wonder','death','frustration','terrorist','war','surveillance','liberator','palehorse','silence','con','situation','banknote','check','statement','livelihood','construct','performance','scream','doubt','robbery','clarification','truth','treason'];
const contribution = ['wrote','typed','etched','fabricated','stole','dreamed','generated','imagined','lied','commissioned','whispered','situated','cashed','cached','performed','rode','crafted','robbed','lived','clarified','told','betrayed','invested'];
const declarative = ['heals','destroys','disrupts','colonizes','maims','dreams','declares','imposes','burns','lies','fights','occupied','frustrates','terrorizes','surveills','liberates','conspires','whispers','silences','lives','constructs','performs','kills'];

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

document.getElementById('line-provocation').textContent = 'a ' + pick(provocation);
document.getElementById('line-contribution').textContent = 'I ' + pick(contribution);
document.getElementById('line-declarative').textContent = 'that ' + pick(declarative);

document.getElementById('submit-word').addEventListener('click', function () {
  const word = document.getElementById('word-input').value.trim();
  if (!word) return;
  const subject = encodeURIComponent('poem contribution');
  const body = encodeURIComponent(word);
  window.location.href = 'mailto:glenn@limb.fun?subject=' + subject + '&body=' + body;
  document.getElementById('word-input').value = '';
  document.getElementById('confirmation').style.display = 'block';
});
</script>

MeteorApp.schemeAbilities =  {
  "id": "Abilities",
  "title": "Abilities",
  "type": "object",
  "properties": {
    "range": {
      "type": "object",
      "options": {
        "collapsed": true
      },
      "additionalProperties": false,
      "properties": {
        "range": {
          "type": "number"
        },
        "minRange": {
          "type": "number"
        }
      },
      "required": [
        "range"
      ]
    },
    "firstStrike": {
      "type": "boolean",
      "format": "checkbox"
    },
    "armored": {
      "type": "object",
      "options": {
        "collapsed": true
      },
      "additionalProperties": false,
      "properties": {
        "armor": {
          "type": "number"
        }
      },
      "required": [
        "armor"
      ]
    },
    "vampiric": {
      "type": "boolean",
      "format": "checkbox"
    },
    "noEnemyRetaliation": {
      "type": "boolean",
      "format": "checkbox"
    },
    "piercing": {
      "type": "boolean",
      "format": "checkbox"
    },
    "speed": {
      "type": "object",
      "options": {
        "collapsed": true
      },
      "additionalProperties": false,
      "properties": {
        "speed": {
          "type": "number"
        }
      },
      "required": [
        "speed"
      ]
    },
    "flanking": {
      "type": "object",
      "options": {
        "collapsed": true
      },
      "additionalProperties": false,
      "properties": {
        "damage": {
          "type": "number"
        }
      },
      "required": [
        "damage"
      ]
    },
    "healing": {
      "type": "object",
      "options": {
        "collapsed": true
      },
      "additionalProperties": false,
      "properties": {
        "range": {
          "type": "number"
        },
        "heal": {
          "type": "number"
        }
      },
      "required": [
        "range",
        "heal"
      ]
    },
    "push": {
      "type": "object",
      "options": {
          "collapsed": true
      },
      "additionalProperties": false,
      "properties": {
          "range": {
              "type": "number"
          }
      },
      "required": [
          "range"
      ]
    },
    "ricochet": {
      "type": "boolean",
      "format": "checkbox"
    },
    "block": {
      "type": "object",
      "options": {
        "collapsed": true
      },
      "additionalProperties": false,
      "properties": {
        "range": {
          "type": "number"
        },
        "blockingDamage": {
          "type": "number"
        }
      },
      "required": [
        "range",
        "blockingDamage"
      ]
    },
    "mana": {
      "type": "object",
      "options": {
        "collapsed": true
      },
      "additionalProperties": false,
      "properties": {
        "mana": {
          "type": "number"
        }
      },
      "required": [
        "mana"
      ]
    },
    "regeneration": {
      "type": "object",
      "options": {
        "collapsed": true
      },
      "additionalProperties": false,
      "properties": {
        "regeneration": {
          "type": "number"
        }
      },
      "required": [
        "regeneration"
      ]
    },
    "bash": {
      "type": "boolean",
      "format": "checkbox"
    },
    "evasion": {
      "type": "boolean",
      "format": "checkbox"
    },
    "poison": {
      "type": "object",
      "options": {
        "collapsed": true
      },
      "additionalProperties": false,
      "properties": {
        "poisonDamage": {
          "type": "number"
        }
      },
      "required": [
        "poisonDamage"
      ]
    },
    "damageCurse": {
      "type": "object",
      "options": {
        "collapsed": true
      },
      "additionalProperties": false,
      "properties": {
        "damageReduction": {
          "type": "number"
        }
      },
      "required": [
        "damageReduction"
      ]
    },
    "aoe": {
      "type": "object",
      "options": {
        "collapsed": true
      },
      "additionalProperties": false,
      "properties": {
        "range": {
          "type": "number"
        },
        "diagonal": {
          "type": "boolean",
          "format": "checkbox"
        }
      },
      "required": [
        "range",
        "diagonal"
      ]
    },
    "hpAura": {
      "type": "object",
      "options": {
        "collapsed": true
      },
      "additionalProperties": false,
      "properties": {
        "range": {
          "type": "number"
        },
        "hpBuff": {
          "type": "number"
        }
      },
      "required": [
        "range",
        "hpBuff"
      ]
    },
    "aiming": {
      "type": "object",
      "options": {
        "collapsed": true
      },
      "additionalProperties": false,
      "properties": {
        "numberOfAimingForAttack": {
          "type": "number"
        },
        "damage": {
          "type": "number"
        }
      },
      "required": [
        "numberOfAimingForAttack",
        "damage"
      ]
    }
  },
  "additionalProperties": false
}

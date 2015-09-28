/**
 * Given a set of strings such as search terms, this class allows you to search
 * for that string by prefix.
 * @author John Taylor
 *
 */
function PrefixStore()
{
	// This is a naive implementation that simply stores all the prefixes in a
	// hashmap.  A better solution would be to use a trie.
	// TODO(johntaylor): reimplement this, probably as a trie.
	var store = {};
	var EMPTY_SET = {};

	/**
	* Search for any queries matching this prefix.  Note that the prefix is
	* case-independent.
	*/
	this.queryByPrefix = function (prefix)
	{
		var results = store[prefix.toLowerCase()];
		if (results == null)
		{
			return EMPTY_SET;
		}
		return results;
	};

	/**
	* Put a new string in the store.
	*/
	this.add = function (string)
	{
		// Add value to every prefix list.  Not exactly space-efficient, but time's
		// getting on.
		for (var i = 0; i < string.length; ++i)
		{
			var prefix = string.substring(0, i + 1).toLowerCase();
			var currentList = store[prefix];
			if (currentList == null)
			{
				currentList = {};
				store[prefix.toLowerCase()] = currentList;
			}
			currentList[string] = string;
		}
	};

	/**
	* Put a whole load of objects in the store at once.
	* @param strings a collection of strings.
	*/
	this.addAll = function (strings)
	{
		strings.forEach(function (string)
		{
			add(string);
		});
	};
}

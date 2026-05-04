package com.aether.RadioAether.model.entity;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Unit tests for {@link UserPreferences}.
 * Exercises Lombok-generated methods (equals, hashCode, toString, getters/setters)
 * to ensure meaningful coverage of the entity's behaviour.
 *
 * @author prorix
 * @author mahoramas
 * @version 1.0.0
 */
class UserPreferencesTest {

    @Test
    @DisplayName("builder: creates instance with expected values")
    void builder_createsInstanceWithExpectedValues() {
        UserPreferences prefs = UserPreferences.builder()
                .id(1L)
                .favoriteGenres(List.of("rock", "pop"))
                .build();

        assertThat(prefs.getId()).isEqualTo(1L);
        assertThat(prefs.getFavoriteGenres()).containsExactly("rock", "pop");
    }

    @Test
    @DisplayName("noArgsConstructor: creates instance with null fields")
    void noArgsConstructor_createsEmptyInstance() {
        UserPreferences prefs = new UserPreferences();
        assertThat(prefs.getId()).isNull();
    }

    @Test
    @DisplayName("setters: mutate fields correctly")
    void setters_mutateFieldsCorrectly() {
        UserPreferences prefs = new UserPreferences();
        prefs.setId(42L);
        prefs.setFavoriteGenres(List.of("jazz", "blues"));

        assertThat(prefs.getId()).isEqualTo(42L);
        assertThat(prefs.getFavoriteGenres()).containsExactly("jazz", "blues");
    }

    @Test
    @DisplayName("equals: two instances with same id are equal")
    void equals_sameIdAreEqual() {
        UserPreferences a = UserPreferences.builder().id(1L).favoriteGenres(List.of("rock")).build();
        UserPreferences b = UserPreferences.builder().id(1L).favoriteGenres(List.of("pop")).build();

        assertThat(a).isEqualTo(b);
    }

    @Test
    @DisplayName("equals: instances with different ids are not equal")
    void equals_differentIdsAreNotEqual() {
        UserPreferences a = UserPreferences.builder().id(1L).build();
        UserPreferences b = UserPreferences.builder().id(2L).build();

        assertThat(a).isNotEqualTo(b);
    }

    @Test
    @DisplayName("hashCode: same id produces same hashCode")
    void hashCode_sameIdProducesSameHashCode() {
        UserPreferences a = UserPreferences.builder().id(5L).build();
        UserPreferences b = UserPreferences.builder().id(5L).build();

        assertThat(a.hashCode()).isEqualTo(b.hashCode());
    }

    @Test
    @DisplayName("toString: contains class name and id")
    void toString_containsRelevantInfo() {
        UserPreferences prefs = UserPreferences.builder().id(7L).build();
        String result = prefs.toString();

        assertThat(result).contains("UserPreferences");
        assertThat(result).contains("7");
    }
}

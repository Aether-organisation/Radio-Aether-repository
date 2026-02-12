package com.aether.RadioAether.runner;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import com.aether.RadioAether.model.entity.Role;
import com.aether.RadioAether.model.entity.Station;
import com.aether.RadioAether.model.enums.RoleName;
import com.aether.RadioAether.repository.RoleRepository;
import com.aether.RadioAether.repository.StationRepository;

/**
 * Role initializer
 * @author prorix
 * @author mahoramas
 * @version 1.0
 */
@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private StationRepository stationRepository;


    @Override
    public void run(String... args) throws Exception {
        if (roleRepository.findByName(RoleName.ROLE_USER).isEmpty()) {
            roleRepository.save(Role.builder().name(RoleName.ROLE_USER).build());
        }
        if (roleRepository.findByName(RoleName.ROLE_ADMIN).isEmpty()) {
            roleRepository.save(Role.builder().name(RoleName.ROLE_ADMIN).build());
        }
        if (roleRepository.findByName(RoleName.ROLE_B2B).isEmpty()) {
            roleRepository.save(Role.builder().name(RoleName.ROLE_B2B).build());
        }
        if (stationRepository.count() == 0) {
              // 1. Radio Europa (Puerto de la Cruz)
            Station radioEuropa = Station.builder()
                    .nombre("Radio Europa")
                    .streamUrl("http://str1.mediatelekom.net:9968/stream")
                    .logoURL("https://radio-europa.fm/wp-content/uploads/2022/01/RE-Logo-600x600-1.png")
                    .generoPrincipal("Pop / Variedad")
                    .latitud(28.4177)
                    .longitud(-16.5459)
                    .pais("España")
                    .build();

            // 2. HIT FM (Santa Cruz)
            Station hitFm = Station.builder()
                    .nombre("HIT FM Canarias")
                    .streamUrl("https://adhandler.kissfmradio.cires21.com/get_link?url=https://bbhitfm.kissfmradio.cires21.com/bbhitfm.mp3")
                    .logoURL("https://www.hitfm.es/wp-content/uploads/2020/01/HITpodcast1500.jpg")
                    .generoPrincipal("Top Hits / Pop")
                    .latitud(28.4636)
                    .longitud(-16.2518)
                    .pais("España")
                    .build();

            // 3. KISS FM (La Laguna)
            Station kissFm = Station.builder()
                    .nombre("KISS FM Canarias")
                    .streamUrl("https://adhandler.kissfmradio.cires21.com/get_link?url=https://bbkissfm.kissfmradio.cires21.com/bbkissfm.mp3")
                    .logoURL("https://static.mytuner.mobi/media/tvos_radios/117/kiss-fm.51b9402b.jpg")
                    .generoPrincipal("Adult Contemporary / 80s 90s")
                    .latitud(28.4853)
                    .longitud(-16.3159)
                    .pais("España")
                    .build();

            // 4. RUMBEROS FM (La Orotava / Norte)
            Station rumberosFm = Station.builder()
                    .nombre("Rumberos FM")
                    .streamUrl("https://str1.mediatelekom.net:9952/stream")
                    .logoURL("https://static.mytuner.mobi/media/tvos_radios/wvyf5ug4zutd.png")
                    .generoPrincipal("Latino / Rumba")
                    .latitud(28.3907)
                    .longitud(-16.5235)
                    .pais("España")
                    .build();

            // 5. LA MUEVE FM (Adeje / Sur)
            Station laMueveFm = Station.builder()
                    .nombre("La Mueve FM")
                    .streamUrl("https://sunaer-stream.com:7113/LA_MUEVE_CADENA_SD")
                    .logoURL("https://static.mytuner.mobi/media/tvos_radios/020/la-mueve-fm.90b8010b.jpg")
                    .generoPrincipal("Urbano / Reggaeton")
                    .latitud(28.0778)
                    .longitud(-16.7317)
                    .pais("España")
                    .build();

            // Guardamos todas en la base de datos
            stationRepository.saveAll(List.of(radioEuropa, hitFm, kissFm, rumberosFm, laMueveFm));

        }

    }
}

